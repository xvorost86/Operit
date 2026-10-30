package com.ai.assistance.operit.data.mcp

import android.content.Context
import com.ai.assistance.operit.R
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser

/** Parsed standard MCP configuration used by both UI and market imports. */
internal data class McpConfigImport(
    val servers: List<McpImportedServer>
)

internal sealed interface McpImportedServer {
    val id: String
    val disabled: Boolean
}

internal data class StdioMcpImportedServer(
    override val id: String,
    val command: String,
    val args: List<String>,
    val env: Map<String, String>,
    val autoApprove: List<String>,
    override val disabled: Boolean
) : McpImportedServer

internal data class RemoteMcpImportedServer(
    override val id: String,
    val endpoint: String,
    val connectionType: String,
    val headers: Map<String, String>,
    override val disabled: Boolean
) : McpImportedServer

/**
 * Parses the public MCP configuration format without conflating HTTP transports with stdio.
 */
internal object McpConfigImportParser {
    private const val STREAMABLE_HTTP_TYPE = "streamable_http"
    private const val SSE_TYPE = "sse"
    private const val STDIO_TYPE = "stdio"

    fun parse(jsonConfig: String, context: Context): McpConfigImport {
        val root = try {
            JsonParser.parseString(jsonConfig)
        } catch (e: Exception) {
            throw IllegalArgumentException(
                context.getString(R.string.l10n_mcp_parser_invalid_json),
                e
            )
        }

        require(root.isJsonObject) {
            context.getString(R.string.l10n_mcp_parser_root_must_be_object)
        }
        val mcpServers = root.asJsonObject.requiredObject("mcpServers", context)
        require(mcpServers.entrySet().isNotEmpty()) {
            context.getString(R.string.l10n_mcp_parser_mcp_servers_empty)
        }

        return McpConfigImport(
            servers = mcpServers.entrySet().map { (serverId, configElement) ->
                parseServer(serverId, configElement, context)
            }
        )
    }

    private fun parseServer(
        serverId: String,
        configElement: JsonElement,
        context: Context
    ): McpImportedServer {
        require(serverId.isNotBlank()) {
            context.getString(R.string.l10n_mcp_parser_blank_server_id)
        }
        require(configElement.isJsonObject) {
            context.getString(R.string.l10n_mcp_parser_server_must_be_object, serverId)
        }

        val config = configElement.asJsonObject
        val declaredType = config.optionalString("type", context)
        return if (config.has("command")) {
            parseStdioServer(serverId, config, declaredType, context)
        } else {
            parseRemoteServer(serverId, config, declaredType, context)
        }
    }

    private fun parseStdioServer(
        serverId: String,
        config: JsonObject,
        declaredType: String?,
        context: Context
    ): StdioMcpImportedServer {
        require(declaredType == null || declaredType == STDIO_TYPE) {
            context.getString(R.string.l10n_mcp_parser_stdio_conflicts_with_transport, serverId)
        }

        return StdioMcpImportedServer(
            id = serverId,
            command = config.requiredNonBlankString("command", serverId, context),
            args = config.optionalStringList("args", serverId, context),
            env = config.optionalStringMap("env", serverId, context),
            autoApprove = config.optionalStringList("autoApprove", serverId, context),
            disabled = config.optionalBoolean("disabled", serverId, context)
        )
    }

    private fun parseRemoteServer(
        serverId: String,
        config: JsonObject,
        declaredType: String?,
        context: Context
    ): RemoteMcpImportedServer {
        val connectionType = when (declaredType) {
            STREAMABLE_HTTP_TYPE -> "httpStream"
            SSE_TYPE -> SSE_TYPE
            STDIO_TYPE -> throw IllegalArgumentException(
                context.getString(R.string.l10n_mcp_parser_missing_command, serverId)
            )
            null -> throw IllegalArgumentException(
                context.getString(R.string.l10n_mcp_parser_missing_command_or_type, serverId)
            )
            else -> throw IllegalArgumentException(
                context.getString(
                    R.string.l10n_mcp_parser_unsupported_transport,
                    serverId,
                    declaredType
                )
            )
        }

        return RemoteMcpImportedServer(
            id = serverId,
            endpoint = config.requiredNonBlankString("url", serverId, context),
            connectionType = connectionType,
            headers = config.optionalStringMap("headers", serverId, context),
            disabled = config.optionalBoolean("disabled", serverId, context)
        )
    }

    private fun JsonObject.requiredObject(field: String, context: Context): JsonObject {
        val value = get(field)
            ?: throw IllegalArgumentException(
                context.getString(R.string.l10n_mcp_parser_missing_field, field)
            )
        require(value.isJsonObject) {
            context.getString(R.string.l10n_mcp_parser_field_must_be_object, field)
        }
        return value.asJsonObject
    }

    private fun JsonObject.requiredNonBlankString(
        field: String,
        serverId: String,
        context: Context
    ): String {
        val value = optionalString(field, context)
            ?: throw IllegalArgumentException(
                context.getString(R.string.l10n_mcp_parser_server_missing_field, serverId, field)
            )
        require(value.isNotBlank()) {
            context.getString(R.string.l10n_mcp_parser_server_field_blank, serverId, field)
        }
        return value.trim()
    }

    private fun JsonObject.optionalString(field: String, context: Context): String? {
        val value = get(field) ?: return null
        require(value.isJsonPrimitive && value.asJsonPrimitive.isString) {
            context.getString(R.string.l10n_mcp_parser_field_must_be_string, field)
        }
        return value.asString
    }

    private fun JsonObject.optionalBoolean(
        field: String,
        serverId: String,
        context: Context
    ): Boolean {
        val value = get(field) ?: return false
        require(value.isJsonPrimitive && value.asJsonPrimitive.isBoolean) {
            context.getString(R.string.l10n_mcp_parser_field_must_be_boolean, serverId, field)
        }
        return value.asBoolean
    }

    private fun JsonObject.optionalStringList(
        field: String,
        serverId: String,
        context: Context
    ): List<String> {
        val value = get(field) ?: return emptyList()
        require(value.isJsonArray) {
            context.getString(R.string.l10n_mcp_parser_field_must_be_string_array, serverId, field)
        }
        return value.asJsonArray.mapIndexed { index, item ->
            require(item.isJsonPrimitive && item.asJsonPrimitive.isString) {
                context.getString(
                    R.string.l10n_mcp_parser_array_item_must_be_string,
                    serverId,
                    field,
                    index
                )
            }
            item.asString
        }
    }

    private fun JsonObject.optionalStringMap(
        field: String,
        serverId: String,
        context: Context
    ): Map<String, String> {
        val value = get(field) ?: return emptyMap()
        require(value.isJsonObject) {
            context.getString(R.string.l10n_mcp_parser_field_must_be_json_object, serverId, field)
        }
        return value.asJsonObject.entrySet().associate { (key, item) ->
            require(key.isNotBlank()) {
                context.getString(
                    R.string.l10n_mcp_parser_field_contains_blank_key,
                    serverId,
                    field
                )
            }
            require(item.isJsonPrimitive && item.asJsonPrimitive.isString) {
                context.getString(
                    R.string.l10n_mcp_parser_field_value_must_be_string,
                    serverId,
                    field,
                    key
                )
            }
            key to item.asString
        }
    }
}
