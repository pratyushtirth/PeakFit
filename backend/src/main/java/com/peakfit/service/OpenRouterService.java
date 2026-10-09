package com.peakfit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.peakfit.dto.request.GenerateWorkoutRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    // Fast, structured JSON output — ideal for workout plan generation
    private static final String MODEL_WORKOUT = "meta-llama/llama-3.3-70b-instruct:free";

    // Deep reasoning + empathy — ideal for Sage injury assessment and chat
    private static final String MODEL_SAGE    = "meta-llama/llama-3.3-70b-instruct:free";

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(60)) // match request timeout
            .build();

    // ── PUBLIC METHODS ───────────────────────────────────────────────────────

    public String generateWorkoutPlan(GenerateWorkoutRequest req) throws Exception {
        String prompt = buildWorkoutPrompt(req);
        return callOpenRouter(
            MODEL_WORKOUT,
            "You are an expert personal trainer. " +
            "Always respond with valid JSON only — no markdown, no code blocks, no extra text. " +
            "You MUST follow the exact number of training days specified by the user.",
            prompt,
            90,   // longer timeout for larger plans
            4000  // 6 days × 5 exercises needs ~3500 tokens — never truncate
        );
    }

    public String chatWithSage(String userMessage, String conversationHistory) throws Exception {
        String systemPrompt = """
            You are Sage, an AI fitness assistant for PeakFit — a premium workout tracking app.
            You are knowledgeable, empathetic, and safety-conscious.

            Your capabilities:
            - Help users understand exercises and proper form
            - Adjust workout recommendations based on injuries or pain
            - Recommend rest days or doctor visits when injuries seem serious
            - Explain muscle groups and recovery strategies
            - Answer general fitness and nutrition questions

            When a user reports pain or injury:
            1. Acknowledge their concern with empathy
            2. Assess severity based on their description
            3. If mild: suggest modifications or alternative exercises
            4. If moderate: recommend reducing intensity and avoiding the affected area
            5. If severe: strongly recommend rest and consulting a medical professional
            6. Always prioritize safety over performance

            Keep responses concise (2-4 sentences) unless detailed explanation is needed.
            Do not diagnose medical conditions — always recommend professional medical advice for serious issues.
            """;

        String fullUserMessage = conversationHistory.isEmpty()
                ? userMessage
                : conversationHistory + "\n\nUser: " + userMessage;

        return callOpenRouter(MODEL_SAGE, systemPrompt, fullUserMessage, 120, 2000);
    }

    public String generateInjuryAdjustedPlan(GenerateWorkoutRequest req) throws Exception {
        String prompt = buildInjuryPrompt(req);
        return callOpenRouter(
            MODEL_SAGE,
            "You are an expert personal trainer and sports rehabilitation specialist. " +
            "Always respond with valid JSON only — no markdown, no code blocks, no extra text.",
            prompt,
            120,
            3000
        );
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private String callOpenRouter(String model, String systemPrompt,
                                  String userMessage, int timeoutSeconds, int maxTokens) throws Exception {
        // Retry once automatically on transient failures (rate limit / model busy)
        int maxAttempts = 2;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                String result = doCallOpenRouter(model, systemPrompt, userMessage, timeoutSeconds, maxTokens);
                return result;
            } catch (Exception e) {
                lastException = e;
                String msg = e.getMessage() != null ? e.getMessage() : "";
                // On rate limit (429) wait 3s then retry; on other errors retry immediately
                if (attempt < maxAttempts) {
                    if (msg.contains("429")) {
                        Thread.sleep(3000);
                    } else if (msg.contains("503") || msg.contains("timeout") || msg.contains("timed out")) {
                        Thread.sleep(1500);
                    } else {
                        // Non-retriable error (bad key, 400, etc.) — fail immediately
                        break;
                    }
                }
            }
        }
        throw lastException != null ? lastException : new RuntimeException("AI request failed");
    }

    private String doCallOpenRouter(String model, String systemPrompt,
                                    String userMessage, int timeoutSeconds, int maxTokens) throws Exception {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user",   "content", userMessage)
                ),
                "temperature", 0.7,
                "max_tokens",  maxTokens
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .header("Authorization",  "Bearer " + apiKey)
                .header("Content-Type",   "application/json")
                .header("HTTP-Referer",   "https://peakfit.app")
                .header("X-Title",        "PeakFit")
                .POST(HttpRequest.BodyPublishers.ofString(
                        objectMapper.writeValueAsString(requestBody)))
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 429) {
            throw new RuntimeException("RATE_LIMITED: Free tier daily limit reached. Please wait a few minutes and try again.");
        }
        if (response.statusCode() == 503 || response.statusCode() == 502) {
            throw new RuntimeException("MODEL_BUSY: The AI model is temporarily busy. Please try again in a moment.");
        }
        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenRouter API error " + response.statusCode() + ": " + response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());
        JsonNode choices = json.get("choices");
        if (choices == null || choices.size() == 0) {
            throw new RuntimeException("MODEL_EMPTY: The AI returned an empty response. Please try again.");
        }
        return choices.get(0).get("message").get("content").asText();
    }

    private String buildWorkoutPrompt(GenerateWorkoutRequest req) {
        String weight       = req.getWeight()            != null ? req.getWeight()            : "75";
        String targetWeight = req.getTargetWeight()      != null ? req.getTargetWeight()      : "70";
        String height       = req.getHeight()            != null ? req.getHeight()            : "175";
        String age          = req.getAge()               != null ? req.getAge()               : "25";
        String preference   = req.getTrainingPreference()!= null ? req.getTrainingPreference(): "gym";
        String goal         = req.getPrimaryGoal()       != null ? req.getPrimaryGoal()       : "muscle-gain";
        String level        = req.getFitnessLevel()      != null ? req.getFitnessLevel()      : "beginner";
        int    days         = req.getDaysPerWeek()       != null ? req.getDaysPerWeek()       : 4;

        // Build day list as plain text — no nested JSON template to confuse the model
        StringBuilder dayList = new StringBuilder();
        String[] focuses = {"Chest & Triceps", "Back & Biceps", "Legs & Glutes",
                            "Shoulders & Arms", "Full Body", "Core & Cardio"};
        for (int i = 1; i <= days; i++) {
            String focus = focuses[(i - 1) % focuses.length];
            dayList.append(String.format("Day %d: %s%n", i, focus));
        }

        return String.format("""
                You are an expert personal trainer. Generate a %d-day workout plan as a single valid JSON object.

                User profile:
                - Weight: %s kg, Target: %s kg, Height: %s cm, Age: %s years
                - Fitness level: %s, Training: %s, Goal: %s

                Days to generate:
                %s
                Rules:
                - Output ONLY the JSON object, nothing else
                - Each day must have EXACTLY 5 exercises
                - Every exercise needs: name, sets (integer), reps (string), rest (string), notes (string)

                Required JSON format:
                {"planName":"string","description":"string","frequency":"%d Days / Week","estimatedTime":"45 Minutes","complexity":2,"days":[{"day":"Day 1 - Focus","exercises":[{"name":"Exercise","sets":3,"reps":"10-12","rest":"60s","notes":"tip"},{"name":"Exercise","sets":3,"reps":"10-12","rest":"60s","notes":"tip"},{"name":"Exercise","sets":3,"reps":"10-12","rest":"60s","notes":"tip"},{"name":"Exercise","sets":3,"reps":"10-12","rest":"60s","notes":"tip"},{"name":"Exercise","sets":3,"reps":"10-12","rest":"60s","notes":"tip"}]}]}
                """, days, weight, targetWeight, height, age, level, preference, goal,
                dayList.toString(), days);
    }

    private String buildInjuryPrompt(GenerateWorkoutRequest req) {
        String injured  = req.getInjuredMuscles() != null ? req.getInjuredMuscles() : "none";
        String severity = req.getInjurySeverity() != null ? req.getInjurySeverity() : "mild";
        String goal     = req.getPrimaryGoal()    != null ? req.getPrimaryGoal()    : "general fitness";
        String level    = req.getFitnessLevel()   != null ? req.getFitnessLevel()   : "beginner";

        return String.format("""
                Generate a modified workout plan for a user with the following injury/pain:
                - Affected muscles/areas: %s
                - Injury severity: %s
                - Fitness goal: %s
                - Fitness level: %s

                IMPORTANT: Avoid exercises that stress the injured areas. Focus on recovery-friendly alternatives.
                If severity is "severe", include mostly rest, mobility work, and unaffected muscle groups.

                Return ONLY a JSON object with this structure:
                {
                  "planName": "Modified Recovery Plan",
                  "description": "brief explanation of modifications made",
                  "frequency": "X Days / Week",
                  "estimatedTime": "XX Minutes",
                  "complexity": 2,
                  "injuryNote": "important safety note about the injury",
                  "days": [
                    {
                      "day": "Day 1 - Focus Area",
                      "exercises": [
                        {
                          "name": "Exercise Name",
                          "sets": 3,
                          "reps": "10-12",
                          "rest": "60s",
                          "notes": "modification or safety tip"
                        }
                      ]
                    }
                  ]
                }
                """, injured, severity, goal, level);
    }
}
