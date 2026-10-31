import { useEffect, useState, type ReactNode } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DataObjectIcon,
  HistoryIcon,
  InfoIcon,
  LinkIcon,
  LockIcon,
  PersonIcon,
  SaveIcon,
  TuneIcon
} from '../../../../util/chatIcons';
import type {
  WebInputSettingsState,
  WebModelSelectorConfig,
  WebMemorySelectorState,
  WebModelSelectorState,
  WebSelectModelResponse,
  WebThinkingQualityMapping
} from '../../../../util/chatTypes';
import { t, tf } from '../../../../util/i18n';
import { CharacterCardModelBindingSwitchConfirmDialog } from '../common/CharacterCardModelBindingSwitchConfirmDialog';
import { ThinkingQualitySlider } from '../common/ThinkingQualitySlider';

type InfoContent = {
  title: string;
  description: string;
};

type IconComponent = (props: { size?: number }) => ReactNode;
type PendingSelection = {
  configId: string;
  modelIndex: number;
};

const AUTO_GLM_WARNING = t(
  '禁止使用autoglm作为对话主模型。对话模型和ui控制模型是分离的，请选择任意一个别的聪明的大模型。如有疑问，请仔细阅读文档学习软件的模型配置机制。',
  'Using autoglm as the main conversation model is prohibited. The conversation model and UI control model are separated. Please choose any other smart large model. If you have questions, please read the documentation carefully to learn about the model configuration mechanism.',
  'Не используйте autoglm как основную модель беседы. Модель беседы и модель управления интерфейсом настраиваются отдельно: выберите для беседы другую подходящую языковую модель. Подробности настройки моделей описаны в документации.'
);

const INFO_COPY = {
  thinkingSettings: {
    title: t('思考', 'Thinking', 'Рассуждения'),
    description: t('管理思考模式', 'Manage thinking mode', 'Управление режимом рассуждений')
  },
  thinkingMode: {
    title: t('思考模式', 'Thinking Mode', 'Режим рассуждений'),
    description: t(
      '目前支持Gemini、Qwen3、Claude、豆包、NVIDIA、硅基流动和MNN本地模型，能够启用内置的思考。',
      'Currently supports the built-in thinking of Gemini, Qwen3, Claude, Doubao, NVIDIA, SiliconFlow and local MNN models.',
      'Сейчас поддерживаются встроенные рассуждения Gemini, Qwen3, Claude, Doubao, NVIDIA, SiliconFlow и локальных моделей MNN.'
    )
  },
  thinkingQuality: {
    title: t('思考程度', 'Thinking intensity', 'Интенсивность рассуждений'),
    description: t(
      '仅在思考模式下生效；具体档位与当前模型配置一致。',
      'Applies only in thinking mode; the available levels follow the current model configuration.',
      'Действует только в режиме рассуждений; доступные уровни соответствуют настройкам текущей модели.'
    )
  },
  maxMode: {
    title: t('Max模式', 'Max Mode', 'Режим Max'),
    description: t(
      '开启后使用更大的上下文窗口。',
      'Uses a larger context window when enabled.',
      'При включении используется большее окно контекста.'
    )
  },
  memory: {
    title: t('记忆', 'Memory', 'Память'),
    description: t(
      '切换当前对话使用的记忆配置。',
      'Switches the memory profile used by this conversation.',
      'Переключает профиль памяти для текущей беседы.'
    )
  },
  memoryAutoUpdate: {
    title: t('自动保存记忆', 'Auto Save Memory', 'Автосохранение памяти'),
    description: t(
      '开启后，当前轮回复结束时会把候选内容加入长期记忆队列。',
      'When enabled, candidate content from the finished turn is queued for long-term memory.',
      'При включении содержимое, отобранное после завершения хода, попадает в очередь долговременной памяти.'
    )
  },
  manualMemoryUpdate: {
    title: t('手动更新记忆', 'Update memory now', 'Обновить память сейчас'),
    description: t(
      '立即基于当前对话内容触发一次记忆保存。',
      'Triggers one memory save from the current conversation right away.',
      'Сразу запускает одно сохранение памяти по текущей беседе.'
    )
  },
  manualConversationSummary: {
    title: t('手动总结对话', 'Manual Conversation Summary', 'Ручная сводка беседы'),
    description: t(
      '立即为当前对话生成一次总结。',
      'Generates a summary of the current conversation right away.',
      'Сразу создаёт сводку текущей беседы.'
    )
  },
  autoRead: {
    title: t('自动朗读', 'Auto Read', 'Авточтение'),
    description: t(
      '收到新回复后自动朗读内容。',
      'Reads new replies aloud automatically.',
      'Автоматически озвучивает новые ответы.'
    )
  },
  autoApprove: {
    title: t('自动批准', 'Auto-approve', 'Автоподтверждение'),
    description: t(
      '开启后，默认直接执行所有工具调用而不再弹出确认。',
      'When enabled, all tool calls run without a confirmation prompt.',
      'При включении все вызовы инструментов выполняются без запроса подтверждения.'
    )
  },
  disableGroup: {
    title: t('禁用项', 'Disable Options', 'Параметры отключения'),
    description: t(
      '集中管理会影响回复行为的禁用开关。',
      'All switches that change reply behaviour in one place.',
      'Все переключатели, влияющие на поведение ответов, в одном месте.'
    )
  },
  disableStream: {
    title: t('禁用流式输出', 'Disable Stream Output', 'Отключить потоковый вывод'),
    description: t(
      '禁用后，AI回复将一次性完整显示，而不是逐字流式显示。',
      'The AI reply appears complete at once instead of streaming word by word.',
      'Ответ AI показывается целиком сразу, а не потоком по словам.'
    )
  },
  disableTools: {
    title: t('禁用工具', 'Disable Tools', 'Отключить инструменты'),
    description: t(
      '禁用后，AI将无法调用包括记忆查询在内的内置工具。',
      'The AI can no longer call built-in tools, including memory lookups.',
      'AI больше не сможет вызывать встроенные инструменты, включая запросы к памяти.'
    )
  },
  disablePreferenceDescription: {
    title: t('禁用用户偏好描述', 'Disable user preference description', 'Отключить описание предпочтений'),
    description: t(
      '禁用后，系统提示词中不再附加 User preference description 段落。',
      'The “User preference description” block is no longer appended to the system prompt.',
      'Блок «User preference description» больше не добавляется к системному промпту.'
    )
  }
};

function currentModelName(selector: WebModelSelectorState | null) {
  const value = selector?.current_model_name?.trim();
  return value ? value : t('未选择', 'Not selected', 'Не выбрано');
}

function configModelSummary(config: WebModelSelectorConfig) {
  if (config.models.length > 1) {
    return tf('{0}个模型', '{0} models', 'Моделей: {0}', config.models.length);
  }
  return config.model_name || t('未选择', 'Not selected', 'Не выбрано');
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function ClassicInfoButton({
  onClick
}: {
  onClick: () => void;
}) {
  return (
    <button
      className="classic-settings-info-button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      <InfoIcon size={16} />
    </button>
  );
}

function ClassicInfoSpacer() {
  return <span aria-hidden="true" className="classic-settings-info-spacer" />;
}

function ClassicSettingsRow({
  children,
  className,
  onClick
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <div
        className={joinClasses('classic-settings-popup-row', className)}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }

  return <div className={joinClasses('classic-settings-popup-row', className)}>{children}</div>;
}

function ClassicSettingItem({
  checked,
  icon: Icon,
  onInfoClick,
  onToggle,
  title
}: {
  checked: boolean;
  icon: IconComponent;
  onInfoClick: () => void;
  onToggle: () => void;
  title: string;
}) {
  return (
    <ClassicSettingsRow onClick={onToggle}>
      <span className={joinClasses('classic-settings-popup-icon', checked && 'is-active')}>
        <Icon size={16} />
      </span>
      <ClassicInfoButton onClick={onInfoClick} />
      <ClassicInfoSpacer />
      <span className="classic-settings-popup-copy">
        <strong>{title}</strong>
      </span>
      <span className={joinClasses('classic-settings-switch', checked && 'is-checked')}>
        <span className="classic-settings-switch-thumb" />
      </span>
    </ClassicSettingsRow>
  );
}

function ClassicActionSettingItem({
  icon: Icon,
  onClick,
  onInfoClick,
  title
}: {
  icon: IconComponent;
  onClick: () => void;
  onInfoClick: () => void;
  title: string;
}) {
  return (
    <ClassicSettingsRow className="classic-settings-action-row" onClick={onClick}>
      <span className="classic-settings-popup-icon">
        <Icon size={16} />
      </span>
      <ClassicInfoButton onClick={onInfoClick} />
      <ClassicInfoSpacer />
      <span className="classic-settings-action-title">{title}</span>
    </ClassicSettingsRow>
  );
}

function ClassicModelSelectorItem({
  expanded,
  loading,
  onExpandedChange,
  onInfoClick,
  onSelectModel,
  selector
}: {
  expanded: boolean;
  loading: boolean;
  onExpandedChange: (value: boolean) => void;
  onInfoClick: () => void;
  onSelectModel: (
    configId: string,
    modelIndex: number,
    confirmCharacterCardSwitch?: boolean
  ) => Promise<WebSelectModelResponse | null>;
  selector: WebModelSelectorState | null;
}) {
  const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const modelName = currentModelName(selector);

  useEffect(() => {
    if (!expanded) {
      setExpandedConfigId(null);
    }
  }, [expanded]);

  async function runSelection(configId: string, modelIndex: number, confirmCharacterCardSwitch = false) {
    const response = await onSelectModel(configId, modelIndex, confirmCharacterCardSwitch);
    if (!response) {
      return;
    }

    if (response.requires_character_card_switch_confirmation) {
      setPendingSelection({ configId, modelIndex });
      return;
    }

    if (response.success) {
      setPendingSelection(null);
      setLocalMessage(null);
      setExpandedConfigId(null);
      onExpandedChange(false);
    }
  }

  async function handleSelect(config: WebModelSelectorConfig, modelIndex: number) {
    const modelNameValue = config.models[modelIndex] ?? '';
    if (modelNameValue.toLowerCase().includes('autoglm')) {
      setLocalMessage(AUTO_GLM_WARNING);
      return;
    }

    await runSelection(config.id, modelIndex, false);
  }

  return (
    <>
      <div className="classic-model-selector">
        <ClassicSettingsRow onClick={() => onExpandedChange(!expanded)}>
          <span className="classic-settings-popup-icon">
            <DataObjectIcon size={16} />
          </span>
          <ClassicInfoButton onClick={onInfoClick} />
          <ClassicInfoSpacer />
          <span className="classic-settings-popup-summary-shell">
            <span className="classic-settings-popup-summary">
              <strong>{t('模型:', 'Model:', 'Модель:')}</strong>
              <span className="classic-settings-popup-summary-value">{modelName}</span>
            </span>
          </span>
          <span className="classic-settings-popup-chevron">
            {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          </span>
        </ClassicSettingsRow>

        {expanded ? (
          <div className="classic-model-selector-body">
            {loading ? (
              <div className="classic-model-selector-empty">
                {t('正在加载模型配置...', 'Loading model configuration...', 'Загрузка конфигурации моделей…')}
              </div>
            ) : null}

            {!loading && !selector?.configs.length ? (
              <div className="classic-model-selector-empty">
                {t('没有可用的模型', 'No models available', 'Нет доступных моделей')}
              </div>
            ) : null}

            {!loading
              ? selector?.configs.map((config) => {
                  const isSelected = config.selected;
                  const hasMultipleModels = config.models.length > 1;
                  const isExpanded = expandedConfigId === config.id;

                  return (
                    <div className="classic-model-selector-config-block" key={config.id}>
                      <button
                        className={joinClasses(
                          'classic-model-selector-config-row',
                          isSelected && 'is-selected'
                        )}
                        onClick={() => {
                          if (hasMultipleModels) {
                            setExpandedConfigId(isExpanded ? null : config.id);
                            return;
                          }
                          void handleSelect(config, 0);
                        }}
                        type="button"
                      >
                        <span className="classic-model-selector-config-name">{config.name}</span>
                        {hasMultipleModels ? (
                          <span className="classic-model-selector-config-tail">
                            <span className="classic-model-selector-config-count">
                              {tf('{0}个模型', '{0} models', 'Моделей: {0}', config.models.length)}
                            </span>
                            {isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                          </span>
                        ) : (
                          <span className="classic-model-selector-config-model">
                            {configModelSummary(config)}
                          </span>
                        )}
                      </button>

                      {hasMultipleModels && isExpanded ? (
                        <div className="classic-model-selector-model-list">
                          {config.models.map((item, index) => {
                            const isModelSelected =
                              config.selected && config.selected_model_index === index;
                            return (
                              <button
                                className={joinClasses(
                                  'classic-model-selector-model-row',
                                  isModelSelected && 'is-selected'
                                )}
                                key={`${config.id}-${item}-${index}`}
                                onClick={() => {
                                  void handleSelect(config, index);
                                }}
                                type="button"
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              : null}

            {selector?.locked_by_character_card ? (
              <div className="classic-model-selector-lock-hint">
                {tf(
                  '当前角色卡已固定模型: {0}',
                  'Model is fixed by the character card: {0}',
                  'Модель закреплена карточкой персонажа: {0}',
                  selector.locked_character_card_name || t('当前角色', 'Current character', 'Текущий персонаж')
                )}
              </div>
            ) : null}

            {localMessage ? (
              <div className="classic-model-selector-local-message">{localMessage}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <CharacterCardModelBindingSwitchConfirmDialog
        onConfirm={() => {
          if (!pendingSelection) {
            return;
          }
          void runSelection(
            pendingSelection.configId,
            pendingSelection.modelIndex,
            true
          );
        }}
        onDismiss={() => setPendingSelection(null)}
        open={pendingSelection !== null}
      />
    </>
  );
}

function ClassicMemorySelectorItem({
  expanded,
  memorySelector,
  onManageClick,
  onExpandedChange,
  onInfoClick,
  onSelectProfile
}: {
  expanded: boolean;
  memorySelector: WebMemorySelectorState | null;
  onManageClick?: (() => void) | null;
  onExpandedChange: (value: boolean) => void;
  onInfoClick: () => void;
  onSelectProfile: (profileId: string) => Promise<void>;
}) {
  const currentProfileName =
    memorySelector?.profiles.find((profile) => profile.id === memorySelector.current_profile_id)?.name ??
    t('未选择', 'Not selected', 'Не выбрано');

  return (
    <>
      <ClassicSettingsRow onClick={() => onExpandedChange(!expanded)}>
        <span className="classic-settings-popup-icon">
          <PersonIcon size={16} />
        </span>
        <ClassicInfoButton onClick={onInfoClick} />
        <ClassicInfoSpacer />
        <span className="classic-settings-popup-summary-shell">
          <span className="classic-settings-popup-summary">
            <strong>{t('记忆:', 'Memory:', 'Память:')}</strong>
            <span className="classic-settings-popup-summary-value">{currentProfileName}</span>
          </span>
        </span>
        <span className="classic-settings-popup-chevron">
          {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
        </span>
      </ClassicSettingsRow>

      {expanded ? (
        <div className="classic-settings-option-panel">
          {(memorySelector?.profiles ?? []).map((profile) => {
            const isSelected = profile.id === memorySelector?.current_profile_id;
            return (
              <button
                className={joinClasses('classic-settings-option-row', isSelected && 'is-selected')}
                key={profile.id}
                onClick={() => {
                  void onSelectProfile(profile.id);
                  onExpandedChange(false);
                }}
                type="button"
              >
                <span className="classic-settings-option-label">{profile.name}</span>
              </button>
            );
          })}
          {onManageClick ? (
            <button className="classic-settings-manage-button" onClick={onManageClick} type="button">
              {t('管理配置', 'Manage Configuration', 'Управление конфигурацией')}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function ClassicThinkingSettingsItem({
  enabled,
  expanded,
  onExpandedChange,
  onInfoClick,
  onQualityChange,
  onQualityInfoClick,
  onToggle,
  onToggleInfoClick,
  qualityMapping,
  qualityOptionId
}: {
  enabled: boolean;
  expanded: boolean;
  onExpandedChange: (value: boolean) => void;
  onInfoClick: () => void;
  onQualityChange: (value: string) => void;
  onQualityInfoClick: () => void;
  onToggle: () => void;
  onToggleInfoClick: () => void;
  qualityMapping: WebThinkingQualityMapping | undefined;
  qualityOptionId: string;
}) {
  return (
    <>
      <ClassicSettingsRow onClick={() => onExpandedChange(!expanded)}>
        <span className={joinClasses('classic-settings-popup-icon', enabled && 'is-active')}>
          <TuneIcon size={16} />
        </span>
        <ClassicInfoButton onClick={onInfoClick} />
        <ClassicInfoSpacer />
        <span className="classic-settings-popup-summary">
          <strong>{t('思考:', 'Thinking:', 'Рассуждения:')}</strong>
          <span className="classic-settings-popup-summary-value">
            {enabled ? t('思考模式', 'Thinking Mode', 'Режим рассуждений') : t('关闭', 'Off', 'Выкл.')}
          </span>
        </span>
        <span className="classic-settings-popup-chevron">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </span>
      </ClassicSettingsRow>

      {expanded ? (
        <div className="classic-settings-expand-panel">
          <ClassicSettingItem
            checked={enabled}
            icon={TuneIcon}
            onInfoClick={onToggleInfoClick}
            onToggle={onToggle}
            title={t('思考模式', 'Thinking Mode', 'Режим рассуждений')}
          />
          {enabled && qualityMapping?.mode === 'levels' ? (
            <ClassicSettingsRow className="is-child">
              <span className="classic-settings-popup-icon is-active">
                <TuneIcon size={16} />
              </span>
              <ClassicInfoButton onClick={onQualityInfoClick} />
              <ClassicInfoSpacer />
              <ThinkingQualitySlider
                label={t('思考程度', 'Thinking intensity', 'Интенсивность рассуждений')}
                mapping={qualityMapping}
                onChange={onQualityChange}
                value={qualityOptionId}
              />
            </ClassicSettingsRow>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function ClassicDisableSettingsGroup({
  disableStreamOutput,
  disableUserPreferenceDescription,
  enableTools,
  expanded,
  onDisablePreferenceDescription,
  onDisablePreferenceDescriptionInfoClick,
  onDisableStreamOutput,
  onDisableStreamOutputInfoClick,
  onDisableToolsInfoClick,
  onExpandedChange,
  onGroupInfoClick,
  onToggleTools
}: {
  disableStreamOutput: boolean;
  disableUserPreferenceDescription: boolean;
  enableTools: boolean;
  expanded: boolean;
  onDisablePreferenceDescription: () => void;
  onDisablePreferenceDescriptionInfoClick: () => void;
  onDisableStreamOutput: () => void;
  onDisableStreamOutputInfoClick: () => void;
  onDisableToolsInfoClick: () => void;
  onExpandedChange: (value: boolean) => void;
  onGroupInfoClick: () => void;
  onToggleTools: () => void;
}) {
  const disabledCount = [disableStreamOutput, !enableTools, disableUserPreferenceDescription].filter(Boolean).length;

  return (
    <>
      <ClassicSettingsRow onClick={() => onExpandedChange(!expanded)}>
        <span className="classic-settings-popup-icon">
          <TuneIcon size={16} />
        </span>
        <ClassicInfoButton onClick={onGroupInfoClick} />
        <ClassicInfoSpacer />
        <span className="classic-settings-popup-summary">
          <strong>{t('禁用项:', 'Disabled:', 'Параметры отключения:')}</strong>
          <span className="classic-settings-popup-summary-value">{`${disabledCount}/3`}</span>
        </span>
        <span className="classic-settings-popup-chevron">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </span>
      </ClassicSettingsRow>

      {expanded ? (
        <div className="classic-settings-expand-panel">
          <ClassicSettingItem
            checked={disableStreamOutput}
            icon={InfoIcon}
            onInfoClick={onDisableStreamOutputInfoClick}
            onToggle={onDisableStreamOutput}
            title={t('禁用流式输出', 'Disable Stream Output', 'Отключить потоковый вывод')}
          />
          <ClassicSettingItem
            checked={!enableTools}
            icon={TuneIcon}
            onInfoClick={onDisableToolsInfoClick}
            onToggle={onToggleTools}
            title={t('禁用工具', 'Disable Tools', 'Отключить инструменты')}
          />
          <ClassicSettingItem
            checked={disableUserPreferenceDescription}
            icon={PersonIcon}
            onInfoClick={onDisablePreferenceDescriptionInfoClick}
            onToggle={onDisablePreferenceDescription}
            title={t('禁用用户偏好描述', 'Disable user preference description', 'Отключить описание предпочтений')}
          />
        </div>
      ) : null}
    </>
  );
}

function ClassicInfoPopup({
  content,
  onDismiss
}: {
  content: InfoContent;
  onDismiss: () => void;
}) {
  return (
    <>
      <div className="classic-settings-info-dismiss-layer" onClick={onDismiss} role="presentation" />
      <div className="classic-settings-info-shell" role="presentation">
        <div
          className="classic-settings-info-card"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <h3>{content.title}</h3>
          <p>{content.description}</p>
        </div>
      </div>
    </>
  );
}

export function ClassicChatSettingsBar({
  inputSettings,
  memorySelector,
  modelSelector,
  modelSelectorLoading,
  onRunManualConversationSummary,
  onRunManualMemoryUpdate,
  onSelectModelConfig,
  onSelectMemoryProfile,
  onToggleSettings,
  onUpdateInputSettings,
  settingsOpen
}: {
  contextPercent: number;
  contextCurrentValue: number;
  contextMaxValue: number;
  inputSettings: WebInputSettingsState | null;
  memorySelector: WebMemorySelectorState | null;
  modelSelector: WebModelSelectorState | null;
  modelSelectorLoading: boolean;
  onSelectModelConfig: (
    configId: string,
    modelIndex: number,
    confirmCharacterCardSwitch?: boolean
  ) => Promise<WebSelectModelResponse | null>;
  onSelectMemoryProfile: (profileId: string) => Promise<void>;
  onRunManualConversationSummary: () => Promise<void>;
  onRunManualMemoryUpdate: () => Promise<void>;
  onUpdateInputSettings: (
    payload: Partial<{
      enable_thinking_mode: boolean;
      thinking_option_id: string;
      enable_memory_auto_update: boolean;
      enable_auto_read: boolean;
      enable_max_context_mode: boolean;
      enable_tools: boolean;
      disable_stream_output: boolean;
      disable_user_preference_description: boolean;
      permission_level: string;
    }>
  ) => Promise<void>;
  onToggleSettings: () => void;
  settingsOpen: boolean;
}) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showMemoryDropdown, setShowMemoryDropdown] = useState(false);
  const [showThinkingDropdown, setShowThinkingDropdown] = useState(false);
  const [showDisableSettingsDropdown, setShowDisableSettingsDropdown] = useState(false);
  const [infoPopupContent, setInfoPopupContent] = useState<InfoContent | null>(null);
  const thinkingMapping = modelSelector?.thinking_quality_mapping;
  const thinkingEnabled = (inputSettings?.enable_thinking_mode ?? false) || (thinkingMapping?.reasoning_required ?? false);
  const thinkingQuality = inputSettings
    ? {
        optionId: inputSettings.thinking_option_id,
        mapping: thinkingMapping
      }
    : null;
  useEffect(() => {
    const mapping = thinkingQuality?.mapping;
    if (mapping && mapping.options.length > 0 && !mapping.options.some((option) => option.id === thinkingQuality.optionId)) {
      void onUpdateInputSettings({ thinking_option_id: mapping.options[0].id });
    }
  }, [onUpdateInputSettings, thinkingQuality?.mapping, thinkingQuality?.optionId]);
  const enableMaxContextMode = inputSettings?.enable_max_context_mode ?? false;
  const enableMemoryAutoUpdate = inputSettings?.enable_memory_auto_update ?? false;
  const enableAutoRead = inputSettings?.enable_auto_read ?? false;
  const enableTools = inputSettings?.enable_tools ?? false;
  const disableStreamOutput = inputSettings?.disable_stream_output ?? false;
  const disableUserPreferenceDescription =
    inputSettings?.disable_user_preference_description ?? false;
  const permissionLevel = inputSettings?.permission_level ?? 'ASK';

  function openInfo(content: InfoContent) {
    setInfoPopupContent(content);
    if (settingsOpen) {
      onToggleSettings();
    }
  }

  useEffect(() => {
    if (!settingsOpen) {
      setShowModelDropdown(false);
      setShowMemoryDropdown(false);
      setShowThinkingDropdown(false);
      setShowDisableSettingsDropdown(false);
    }
  }, [settingsOpen]);

  return (
    <div className="classic-chat-settings-bar">
      <button
        aria-expanded={settingsOpen}
        className={`classic-settings-anchor ${settingsOpen ? 'is-active' : ''}`}
        onClick={onToggleSettings}
        type="button"
      >
        <TuneIcon size={22} />
      </button>

      {settingsOpen ? (
        <>
          <div
            className="classic-settings-dismiss-layer"
            onClick={() => {
              if (settingsOpen) {
                onToggleSettings();
              }
            }}
            role="presentation"
          />
          <div
            className="classic-settings-popup-shell"
            role="presentation"
          >
            <div
              className="classic-settings-popup"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="classic-settings-popup-scroll">
                <ClassicModelSelectorItem
                  expanded={showModelDropdown}
                  loading={modelSelectorLoading}
                  onExpandedChange={setShowModelDropdown}
                  onInfoClick={() =>
                    openInfo({
                      title: t('模型配置', 'Model Configuration', 'Конфигурация модели'),
                      description: t(
                        '在这里选择一个已经配置好的模型，或者点击下方的管理配置去新建或修改模型',
                        'Select a configured model here, or click Manage Configuration below to create or modify models',
                        'Выберите здесь настроенную модель или нажмите «Управление конфигурацией» ниже, чтобы создать или изменить модели'
                      )
                    })
                  }
                  onSelectModel={onSelectModelConfig}
                  selector={modelSelector}
                />

                <ClassicMemorySelectorItem
                  expanded={showMemoryDropdown}
                  memorySelector={memorySelector}
                  onExpandedChange={setShowMemoryDropdown}
                  onInfoClick={() => openInfo(INFO_COPY.memory)}
                  onSelectProfile={onSelectMemoryProfile}
                />

                {thinkingQuality && thinkingQuality.mapping?.mode !== 'unsupported' ? (
                  <ClassicThinkingSettingsItem
                    enabled={thinkingEnabled}
                    expanded={showThinkingDropdown}
                    onExpandedChange={setShowThinkingDropdown}
                    onInfoClick={() => openInfo(INFO_COPY.thinkingSettings)}
                    onQualityChange={(value) => {
                      void onUpdateInputSettings({ thinking_option_id: value });
                    }}
                    onQualityInfoClick={() => openInfo(INFO_COPY.thinkingQuality)}
                    onToggle={() => {
                      if (!thinkingQuality?.mapping?.reasoning_required) {
                        void onUpdateInputSettings({ enable_thinking_mode: !thinkingEnabled });
                      }
                    }}
                    onToggleInfoClick={() => openInfo(INFO_COPY.thinkingMode)}
                    qualityMapping={thinkingQuality.mapping}
                    qualityOptionId={thinkingQuality.optionId}
                  />
                ) : null}

                <ClassicDisableSettingsGroup
                  disableStreamOutput={disableStreamOutput}
                  disableUserPreferenceDescription={disableUserPreferenceDescription}
                  enableTools={enableTools}
                  expanded={showDisableSettingsDropdown}
                  onDisablePreferenceDescription={() => {
                    void onUpdateInputSettings({
                      disable_user_preference_description: !disableUserPreferenceDescription
                    });
                  }}
                  onDisablePreferenceDescriptionInfoClick={() =>
                    openInfo(INFO_COPY.disablePreferenceDescription)
                  }
                  onDisableStreamOutput={() => {
                    void onUpdateInputSettings({ disable_stream_output: !disableStreamOutput });
                  }}
                  onDisableStreamOutputInfoClick={() => openInfo(INFO_COPY.disableStream)}
                  onDisableToolsInfoClick={() => openInfo(INFO_COPY.disableTools)}
                  onExpandedChange={setShowDisableSettingsDropdown}
                  onGroupInfoClick={() => openInfo(INFO_COPY.disableGroup)}
                  onToggleTools={() => {
                    void onUpdateInputSettings({ enable_tools: !enableTools });
                  }}
                />

                <ClassicSettingItem
                  checked={enableMaxContextMode}
                  icon={LinkIcon}
                  onInfoClick={() => openInfo(INFO_COPY.maxMode)}
                  onToggle={() => {
                    void onUpdateInputSettings({ enable_max_context_mode: !enableMaxContextMode });
                  }}
                  title={t('Max模式', 'Max Mode', 'Режим Max')}
                />

                <div className="classic-settings-divider" />

                <ClassicSettingItem
                  checked={enableMemoryAutoUpdate}
                  icon={SaveIcon}
                  onInfoClick={() => openInfo(INFO_COPY.memoryAutoUpdate)}
                  onToggle={() => {
                    void onUpdateInputSettings({ enable_memory_auto_update: !enableMemoryAutoUpdate });
                  }}
                  title={t('自动保存记忆', 'Auto Save Memory', 'Автосохранение памяти')}
                />

                <ClassicActionSettingItem
                  icon={SaveIcon}
                  onClick={() => {
                    void onRunManualMemoryUpdate();
                    onToggleSettings();
                  }}
                  onInfoClick={() => openInfo(INFO_COPY.manualMemoryUpdate)}
                  title={t('手动更新记忆', 'Update memory now', 'Обновить память сейчас')}
                />

                <ClassicActionSettingItem
                  icon={HistoryIcon}
                  onClick={() => {
                    void onRunManualConversationSummary();
                    onToggleSettings();
                  }}
                  onInfoClick={() => openInfo(INFO_COPY.manualConversationSummary)}
                  title={t('手动总结对话', 'Manual Conversation Summary', 'Ручная сводка беседы')}
                />

                <div className="classic-settings-divider" />

                <ClassicSettingItem
                  checked={enableAutoRead}
                  icon={HistoryIcon}
                  onInfoClick={() => openInfo(INFO_COPY.autoRead)}
                  onToggle={() => {
                    void onUpdateInputSettings({ enable_auto_read: !enableAutoRead });
                  }}
                  title={t('自动朗读', 'Auto Read', 'Авточтение')}
                />

                <div className="classic-settings-divider" />

                <ClassicSettingItem
                  checked={permissionLevel === 'ALLOW'}
                  icon={LockIcon}
                  onInfoClick={() => openInfo(INFO_COPY.autoApprove)}
                  onToggle={() => {
                    void onUpdateInputSettings({
                      permission_level: permissionLevel === 'ALLOW' ? 'ASK' : 'ALLOW'
                    });
                  }}
                  title={t('自动批准', 'Auto-approve', 'Автоподтверждение')}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {infoPopupContent ? (
        <ClassicInfoPopup content={infoPopupContent} onDismiss={() => setInfoPopupContent(null)} />
      ) : null}
    </div>
  );
}
