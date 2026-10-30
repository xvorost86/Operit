package com.ai.assistance.operit.api.chat.llmprovider

import com.ai.assistance.operit.data.collects.ApiProviderConfigs
import com.ai.assistance.operit.data.collects.ModelThinkingConfigDefaults
import com.ai.assistance.operit.data.model.ApiProviderType
import com.ai.assistance.operit.util.AppLogger
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.After
import org.junit.Before
import org.junit.Test

class XaiProviderReasoningTest {
    private val xaiDefaults = ModelThinkingConfigDefaults.forProvider(ApiProviderType.XAI.name)
    private var previousSystemLogEnabled = true
    private var previousFileLogEnabled = true

    // ModelListFetcher logs through AppLogger, and android.util.Log is not mocked in JVM tests.
    @Before
    fun disableLogging() {
        previousSystemLogEnabled = AppLogger.enableSystemLog
        previousFileLogEnabled = AppLogger.enableFileLogging
        AppLogger.enableSystemLog = false
        AppLogger.enableFileLogging = false
    }

    @After
    fun restoreLogging() {
        AppLogger.enableSystemLog = previousSystemLogEnabled
        AppLogger.enableFileLogging = previousFileLogEnabled
    }

    private fun mapping(modelName: String): ThinkingQualityMapping =
        ThinkingQualityMappingRegistry.resolve(
            providerTypeId = ApiProviderType.XAI.name,
            modelName = modelName,
            thinkingConfigurations = xaiDefaults
        )

    /** Mirrors what XaiProvider.createRequestBody sends for the seeded xAI configuration. */
    private fun requestBody(
        modelName: String,
        optionId: String,
        enableThinking: Boolean
    ): JSONObject {
        val requestJson = JSONObject().put("model", modelName).put("stream", true)
        ThinkingConfigurationApplier.apply(
            requestJson = requestJson,
            providerTypeId = ApiProviderType.XAI.name,
            modelName = modelName,
            apiEndpoint = "https://api.x.ai/v1/chat/completions",
            thinkingConfigurations = xaiDefaults,
            enableThinking = enableThinking,
            optionId = optionId
        )
        return requestJson
    }

    @Test
    fun defaultConfigUsesTheOfficialXaiEndpointAndModel() {
        assertEquals(
            "grok-4.6",
            ApiProviderConfigs.getDefaultModelName(ApiProviderType.XAI)
        )
        assertEquals(
            "https://api.x.ai/v1/chat/completions",
            ApiProviderConfigs.getDefaultApiEndpoint(ApiProviderType.XAI)
        )
        assertEquals(
            "https://api.x.ai/v1/models",
            ModelListFetcher.getModelsListUrl(
                "https://api.x.ai/v1/chat/completions",
                ApiProviderType.XAI
            )
        )
    }

    @Test
    fun grokModelsExposeTheConfiguredEffortLevels() {
        val grokMapping = mapping("grok-4.6")

        assertEquals(ThinkingQualityControl.LEVELS, grokMapping.control)
        assertEquals(
            listOf("low", "medium", "high", "xhigh"),
            grokMapping.options.map { it.id }
        )
    }

    @Test
    fun selectedEffortIsWrittenToReasoningEffort() {
        for (optionId in listOf("low", "medium", "high", "xhigh")) {
            assertEquals(
                optionId,
                requestBody("grok-4.6", optionId, enableThinking = true)
                    .getString("reasoning_effort")
            )
        }
    }

    @Test
    fun requiredEffortIsWrittenEvenWhenThinkingIsOff() {
        assertEquals(
            "high",
            requestBody("grok-4.6", "high", enableThinking = false)
                .getString("reasoning_effort")
        )
    }

    @Test
    fun nonGrokModelsDoNotReceiveReasoningEffort() {
        assertEquals(ThinkingQualityControl.UNSUPPORTED, mapping("custom-model").control)
        assertFalse(
            requestBody("custom-model", "low", enableThinking = true)
                .has("reasoning_effort")
        )
    }
}
