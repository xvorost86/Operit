import { useEffect, useRef, useState, type ReactNode } from 'react';
import { uploadedAttachmentToMessageAttachment } from '../../../../attachments/AttachmentUtils';
import { AttachmentChip } from '../../../AttachmentChip';
import { AttachmentSelector } from '../../../AttachmentSelector';
import { FullscreenInputDialog } from '../../../FullscreenInputDialog';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DataObjectIcon,
  FullscreenIcon,
  HistoryIcon,
  InfoIcon,
  LinkIcon,
  LockIcon,
  PersonIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  StopIcon,
  TuneIcon
} from '../../../../util/chatIcons';
import { InputOverlayPopup } from '../common/InputOverlayPopup';
import { CharacterCardModelBindingSwitchConfirmDialog } from '../common/CharacterCardModelBindingSwitchConfirmDialog';
import { PendingMessageQueuePanel } from '../common/PendingMessageQueuePanel';
import { ThinkingQualitySlider } from '../common/ThinkingQualitySlider';
import { t, tf } from '../../../../util/i18n';
import type {
  InputProcessingStage,
  PendingQueueMessageItem,
  WebInputSettingsState,
  WebMemorySelectorState,
  WebModelSelectorConfig,
  WebModelSelectorState,
  WebSelectModelResponse,
  WebThinkingQualityMapping,
  WebThemeSnapshot,
  WebUploadedAttachment
} from '../../../../util/chatTypes';

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
} as const;

function configModelSummary(config: WebModelSelectorConfig) {
  if (config.models.length > 1) {
    return tf('{0}个模型', '{0} models', 'Моделей: {0}', config.models.length);
  }
  return config.model_name || t('未选择', 'Not selected', 'Не выбрано');
}

function processingLabel(stage: InputProcessingStage) {
  if (stage === 'connecting')
    return t('正在同步会话与主题', 'Syncing the conversation and theme', 'Синхронизация беседы и темы');
  if (stage === 'uploading') return t('正在上传附件', 'Uploading attachments', 'Загрузка вложений');
  if (stage === 'streaming') return t('正在接收回复', 'Receiving the reply', 'Получение ответа');
  return '';
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function AgentInfoButton({
  onClick
}: {
  onClick: () => void;
}) {
  return (
    <button
      className="agent-settings-info-button"
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

function AgentInfoSpacer() {
  return <span aria-hidden="true" className="agent-settings-info-spacer" />;
}

function AgentSettingsRow({
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
        className={joinClasses('agent-settings-row', className)}
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

  return <div className={joinClasses('agent-settings-row', className)}>{children}</div>;
}

function AgentSwitch({
  checked
}: {
  checked: boolean;
}) {
  return (
    <span className={joinClasses('agent-settings-switch', checked && 'is-checked')}>
      <span className="agent-settings-switch-thumb" />
    </span>
  );
}

function AgentSimpleToggleSettingItem({
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
    <AgentSettingsRow onClick={onToggle}>
      <span className={joinClasses('agent-settings-icon', checked && 'is-active')}>
        <Icon size={16} />
      </span>
      <AgentInfoButton onClick={onInfoClick} />
      <AgentInfoSpacer />
      <span className="agent-settings-title">{title}</span>
      <AgentSwitch checked={checked} />
    </AgentSettingsRow>
  );
}

function AgentActionSettingItem({
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
    <AgentSettingsRow onClick={onClick}>
      <span className="agent-settings-icon">
        <Icon size={16} />
      </span>
      <AgentInfoButton onClick={onInfoClick} />
      <AgentInfoSpacer />
      <span className="agent-settings-title">{title}</span>
    </AgentSettingsRow>
  );
}

function AgentModelSelectorItem({
  allowCollapse = true,
  expanded,
  loading,
  onExpandedChange,
  onInfoClick,
  onSelectModel,
  selector
}: {
  allowCollapse?: boolean;
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
  const currentModelName =
    selector?.current_model_name?.trim() || t('未选择', 'Not selected', 'Не выбрано');

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
      if (allowCollapse) {
        onExpandedChange(false);
      }
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
      <div className="agent-model-selector">
        <AgentSettingsRow onClick={allowCollapse ? () => onExpandedChange(!expanded) : undefined}>
          <span className="agent-settings-icon">
            <DataObjectIcon size={16} />
          </span>
          <AgentInfoButton onClick={onInfoClick} />
          <AgentInfoSpacer />
          <span className="agent-settings-summary">
            <strong>{t('模型:', 'Model:', 'Модель:')}</strong>
            <span className="agent-settings-summary-value">{currentModelName}</span>
          </span>
          {allowCollapse ? (
            <span className="agent-settings-chevron">
              {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
            </span>
          ) : null}
        </AgentSettingsRow>

        {expanded ? (
          <div className="agent-model-selector-body">
            {loading ? (
              <div className="agent-model-selector-empty">
                {t('正在加载模型配置...', 'Loading model configuration...', 'Загрузка конфигурации моделей…')}
              </div>
            ) : null}

            {!loading && !selector?.configs.length ? (
              <div className="agent-model-selector-empty">
                {t('没有可用的模型', 'No models available', 'Нет доступных моделей')}
              </div>
            ) : null}

            {!loading
              ? selector?.configs.map((config) => {
                  const isSelected = config.selected;
                  const hasMultipleModels = config.models.length > 1;
                  const isExpanded = expandedConfigId === config.id;

                  return (
                    <div className="agent-model-selector-config-block" key={config.id}>
                      <button
                        className={joinClasses(
                          'agent-model-selector-config-row',
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
                        <span className="agent-model-selector-config-name">{config.name}</span>
                        {hasMultipleModels ? (
                          <span className="agent-model-selector-config-tail">
                            <span className="agent-model-selector-config-count">
                              {tf('{0}个模型', '{0} models', 'Моделей: {0}', config.models.length)}
                            </span>
                            {isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                          </span>
                        ) : (
                          <span className="agent-model-selector-config-model">
                            {configModelSummary(config)}
                          </span>
                        )}
                      </button>

                      {hasMultipleModels && isExpanded ? (
                        <div className="agent-model-selector-model-list">
                          {config.models.map((item, index) => {
                            const isModelSelected =
                              config.selected && config.selected_model_index === index;
                            return (
                              <button
                                className={joinClasses(
                                  'agent-model-selector-model-row',
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
              <div className="agent-model-selector-lock-hint">
                {tf(
                  '当前角色卡已固定模型: {0}',
                  'Model is fixed by the character card: {0}',
                  'Модель закреплена карточкой персонажа: {0}',
                  selector.locked_character_card_name || t('当前角色', 'Current character', 'Текущий персонаж')
                )}
              </div>
            ) : null}

            {localMessage ? <div className="agent-model-selector-local-message">{localMessage}</div> : null}
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

function AgentMemorySelectorItem({
  expanded,
  memorySelector,
  onExpandedChange,
  onInfoClick,
  onSelectProfile
}: {
  expanded: boolean;
  memorySelector: WebMemorySelectorState | null;
  onExpandedChange: (value: boolean) => void;
  onInfoClick: () => void;
  onSelectProfile: (profileId: string) => Promise<void>;
}) {
  const currentProfileName =
    memorySelector?.profiles.find((profile) => profile.id === memorySelector.current_profile_id)?.name ??
    t('未选择', 'Not selected', 'Не выбрано');

  return (
    <>
      <AgentSettingsRow onClick={() => onExpandedChange(!expanded)}>
        <span className="agent-settings-icon">
          <DataObjectIcon size={16} />
        </span>
        <AgentInfoButton onClick={onInfoClick} />
        <AgentInfoSpacer />
        <span className="agent-settings-summary">
          <strong>{t('记忆:', 'Memory:', 'Память:')}</strong>
          <span className="agent-settings-summary-value">{currentProfileName}</span>
        </span>
        <span className="agent-settings-chevron">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </span>
      </AgentSettingsRow>

      {expanded ? (
        <div className="agent-settings-option-panel">
          {(memorySelector?.profiles ?? []).map((profile) => {
            const isSelected = profile.id === memorySelector?.current_profile_id;
            return (
              <button
                className={joinClasses('agent-settings-option-row', isSelected && 'is-selected')}
                key={profile.id}
                onClick={() => {
                  void onSelectProfile(profile.id);
                  onExpandedChange(false);
                }}
                type="button"
              >
                <span className="agent-settings-option-label">{profile.name}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

function AgentThinkingSettingsItem({
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
      <AgentSettingsRow onClick={() => onExpandedChange(!expanded)}>
        <span className={joinClasses('agent-settings-icon', enabled && 'is-active')}>
          <TuneIcon size={16} />
        </span>
        <AgentInfoButton onClick={onInfoClick} />
        <AgentInfoSpacer />
        <span className="agent-settings-summary">
          <strong>{t('思考:', 'Thinking:', 'Рассуждения:')}</strong>
          <span className="agent-settings-summary-value">
            {enabled ? t('思考模式', 'Thinking Mode', 'Режим рассуждений') : t('关闭', 'Off', 'Выкл.')}
          </span>
        </span>
        <span className="agent-settings-chevron">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </span>
      </AgentSettingsRow>

      {expanded ? (
        <div className="agent-settings-expand-panel">
          <AgentSimpleToggleSettingItem
            checked={enabled}
            icon={TuneIcon}
            onInfoClick={onToggleInfoClick}
            onToggle={onToggle}
            title={t('思考模式', 'Thinking Mode', 'Режим рассуждений')}
          />
          {enabled && qualityMapping?.mode === 'levels' ? (
            <AgentSettingsRow className="is-child">
              <span className="agent-settings-icon is-active">
                <TuneIcon size={16} />
              </span>
              <AgentInfoButton onClick={onQualityInfoClick} />
              <AgentInfoSpacer />
              <ThinkingQualitySlider
                label={t('思考程度', 'Thinking intensity', 'Интенсивность рассуждений')}
                mapping={qualityMapping}
                onChange={onQualityChange}
                value={qualityOptionId}
              />
            </AgentSettingsRow>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function AgentMaxContextSettingItem({
  checked,
  onInfoClick,
  onToggle
}: {
  checked: boolean;
  onInfoClick: () => void;
  onToggle: () => void;
}) {
  return (
    <AgentSettingsRow onClick={onToggle}>
      <span className={joinClasses('agent-settings-icon', checked && 'is-active')}>
        <LinkIcon size={16} />
      </span>
      <AgentInfoButton onClick={onInfoClick} />
      <AgentInfoSpacer />
      <span className="agent-settings-title">{t('Max模式', 'Max Mode', 'Режим Max')}</span>
      <AgentSwitch checked={checked} />
    </AgentSettingsRow>
  );
}

function AgentDisableSettingsGroupItem({
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
      <AgentSettingsRow onClick={() => onExpandedChange(!expanded)}>
        <span className="agent-settings-icon">
          <TuneIcon size={16} />
        </span>
        <AgentInfoButton onClick={onGroupInfoClick} />
        <AgentInfoSpacer />
        <span className="agent-settings-summary">
          <strong>{t('禁用项:', 'Disabled:', 'Параметры отключения:')}</strong>
          <span className="agent-settings-summary-value">{`${disabledCount}/3`}</span>
        </span>
        <span className="agent-settings-chevron">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </span>
      </AgentSettingsRow>

      {expanded ? (
        <div className="agent-settings-expand-panel">
          <AgentSimpleToggleSettingItem
            checked={disableStreamOutput}
            icon={InfoIcon}
            onInfoClick={onDisableStreamOutputInfoClick}
            onToggle={onDisableStreamOutput}
            title={t('禁用流式输出', 'Disable Stream Output', 'Отключить потоковый вывод')}
          />
          <AgentSimpleToggleSettingItem
            checked={!enableTools}
            icon={TuneIcon}
            onInfoClick={onDisableToolsInfoClick}
            onToggle={onToggleTools}
            title={t('禁用工具', 'Disable Tools', 'Отключить инструменты')}
          />
          <AgentSimpleToggleSettingItem
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

function AgentInfoPopup({
  content,
  onDismiss
}: {
  content: InfoContent;
  onDismiss: () => void;
}) {
  return (
    <div className="agent-settings-info-scrim" onClick={onDismiss} role="presentation">
      <div className="agent-settings-info-card" onClick={(event) => event.stopPropagation()} role="dialog">
        <h3>{content.title}</h3>
        <p>{content.description}</p>
      </div>
    </div>
  );
}

export function AgentChatInputSection({
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onQueueMessage,
  onCancelMessage,
  onUploadFiles,
  pendingUploads,
  onRemovePendingUpload,
  isLoading,
  inputProcessingStage,
  showInputProcessingStatus,
  attachmentPanelOpen,
  onAttachmentPanelChange,
  pendingQueueMessages,
  isPendingQueueExpanded,
  onPendingQueueExpandedChange,
  onDeletePendingQueueMessage,
  onEditPendingQueueMessage,
  onSendPendingQueueMessage,
  modelSelector,
  modelSelectorLoading,
  onSelectModelConfig,
  memorySelector,
  onSelectMemoryProfile,
  onRunManualMemoryUpdate,
  inputSettings,
  onUpdateInputSettings
}: {
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  onQueueMessage: () => void;
  onCancelMessage: () => void;
  onUploadFiles: (files: FileList | File[]) => Promise<void>;
  pendingUploads: WebUploadedAttachment[];
  onRemovePendingUpload: (attachmentId: string) => void;
  isLoading: boolean;
  inputProcessingStage: InputProcessingStage;
  showInputProcessingStatus: boolean;
  attachmentPanelOpen: boolean;
  onAttachmentPanelChange: (value: boolean) => void;
  pendingQueueMessages: PendingQueueMessageItem[];
  isPendingQueueExpanded: boolean;
  onPendingQueueExpandedChange: (value: boolean) => void;
  onDeletePendingQueueMessage: (id: number) => void;
  onEditPendingQueueMessage: (id: number) => void;
  onSendPendingQueueMessage: (id: number) => Promise<void>;
  modelSelector: WebModelSelectorState | null;
  modelSelectorLoading: boolean;
  onSelectModelConfig: (
    configId: string,
    modelIndex: number,
    confirmCharacterCardSwitch?: boolean
  ) => Promise<WebSelectModelResponse | null>;
  memorySelector: WebMemorySelectorState | null;
  onSelectMemoryProfile: (profileId: string) => Promise<void>;
  onRunManualMemoryUpdate: () => Promise<void>;
  contextPercent: number;
  contextCurrentValue: number;
  contextMaxValue: number;
  inputSettings: WebInputSettingsState | null;
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
  theme: WebThemeSnapshot | null;
}) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [showExtraSettings, setShowExtraSettings] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showThinkingDropdown, setShowThinkingDropdown] = useState(false);
  const [showMemoryDropdown, setShowMemoryDropdown] = useState(false);
  const [showDisableSettingsDropdown, setShowDisableSettingsDropdown] = useState(false);
  const [infoPopupContent, setInfoPopupContent] = useState<InfoContent | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSendMessage = messageInput.trim().length > 0 || pendingUploads.length > 0;
  const showQueueAction = isLoading && messageInput.trim().length > 0;
  const showCancelAction = isLoading && !showQueueAction;
  const showProcessingStatus = showInputProcessingStatus && inputProcessingStage !== 'idle';
  const processingProgress =
    inputProcessingStage === 'streaming' ? 0.82 : inputProcessingStage === 'uploading' ? 0.56 : 0.4;
  const modelLabel = (() => {
    const currentModelName = modelSelector?.current_model_name?.trim();
    if (!currentModelName) {
      return t('模型配置', 'Model Configuration', 'Конфигурация модели');
    }
    return currentModelName.length > 26 ? `${currentModelName.slice(0, 26)}...` : currentModelName;
  })();
  const progressRadius = 18;
  const circumference = 2 * Math.PI * progressRadius;
  const dashOffset = circumference - processingProgress * circumference;
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [messageInput]);

  useEffect(() => {
    if (!showModelSelector) {
      setShowThinkingDropdown(false);
    }
  }, [showModelSelector]);

  useEffect(() => {
    if (!showExtraSettings) {
      setShowMemoryDropdown(false);
      setShowDisableSettingsDropdown(false);
    }
  }, [showExtraSettings]);

  function submitCurrentAction() {
    if (showCancelAction) {
      onCancelMessage();
      return;
    }
    if (showQueueAction) {
      onQueueMessage();
      return;
    }
    if (canSendMessage) {
      void onSendMessage();
    }
  }

  return (
    <div className="agent-chat-input-section">
      <PendingMessageQueuePanel
        expanded={isPendingQueueExpanded}
        onDeleteMessage={onDeletePendingQueueMessage}
        onEditMessage={onEditPendingQueueMessage}
        onExpandedChange={onPendingQueueExpandedChange}
        onSendMessage={(id) => {
          void onSendPendingQueueMessage(id);
        }}
        queuedMessages={pendingQueueMessages}
      />

      {showProcessingStatus ? (
        <div className="input-processing-status is-agent">
          <div className="input-processing-status-message">{processingLabel(inputProcessingStage)}</div>
        </div>
      ) : null}

      {pendingUploads.length ? (
        <div className="composer-attachment-strip is-agent">
          {pendingUploads.map((upload) => (
            <AttachmentChip
              attachment={uploadedAttachmentToMessageAttachment(upload)}
              key={upload.attachment_id}
              onRemove={onRemovePendingUpload}
              removable
            />
          ))}
        </div>
      ) : null}

      <div className="agent-input-card">
        <label className="agent-input-field">
          <textarea
            onChange={(event) => onMessageInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitCurrentAction();
              }
            }}
            placeholder={t('请输入您的问题...', 'Enter your question...', 'Введите вопрос…')}
            ref={textareaRef}
            rows={1}
            value={messageInput}
          />
          <button className="agent-input-fullscreen" onClick={() => setFullscreenOpen(true)} type="button">
            <FullscreenIcon size={16} />
          </button>
        </label>

        <div className="agent-input-bottom">
          <div className="agent-model-slot">
            <button
              aria-expanded={showModelSelector}
              className={`agent-model-pill ${showModelSelector ? 'is-active' : ''}`}
              onClick={() => {
                onAttachmentPanelChange(false);
                setShowExtraSettings(false);
                setShowModelSelector(!showModelSelector);
              }}
              type="button"
            >
              <strong>{modelLabel || t('未选择', 'Not selected', 'Не выбрано')}</strong>
              {showModelSelector ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
            </button>
          </div>

          <button
            className={`agent-icon-button ${showExtraSettings ? 'is-active' : ''}`}
            onClick={() => {
              onAttachmentPanelChange(false);
              setShowModelSelector(false);
              setShowExtraSettings(!showExtraSettings);
            }}
            title={t('设置选项', 'Settings options', 'Параметры настроек')}
            type="button"
          >
            <TuneIcon size={20} />
          </button>

          <button
            className={`agent-icon-button ${attachmentPanelOpen ? 'is-active' : ''}`}
            onClick={() => {
              setShowModelSelector(false);
              setShowExtraSettings(false);
              onAttachmentPanelChange(!attachmentPanelOpen);
            }}
            title={t('附件', 'Attachments', 'Вложения')}
            type="button"
          >
            <PlusIcon size={24} />
          </button>

          <div className="agent-action-orb-shell">
            {showProcessingStatus ? (
              <svg className="agent-action-progress" viewBox="0 0 44 44">
                <circle className="agent-action-progress-track" cx="22" cy="22" r={progressRadius} />
                <circle
                  className="agent-action-progress-value"
                  cx="22"
                  cy="22"
                  r={progressRadius}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
            ) : null}
            <button
              className={[
                'agent-action-orb',
                showQueueAction ? 'is-queue' : '',
                showCancelAction ? 'is-danger' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={submitCurrentAction}
              type="button"
            >
              {showCancelAction ? (
                <StopIcon size={18} />
              ) : (
                <SendIcon size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {showModelSelector ? (
        <InputOverlayPopup onDismiss={() => setShowModelSelector(false)} panelClassName="agent-popup-card">
          <div className="agent-popup-scroll">
            <div className="agent-popup-body">
              {thinkingQuality && thinkingQuality.mapping?.mode !== 'unsupported' ? (
                <AgentThinkingSettingsItem
                  enabled={thinkingEnabled}
                  expanded={showThinkingDropdown}
                  onExpandedChange={setShowThinkingDropdown}
                  onInfoClick={() => setInfoPopupContent(INFO_COPY.thinkingSettings)}
                  onQualityChange={(value) => {
                    void onUpdateInputSettings({ thinking_option_id: value });
                  }}
                  onQualityInfoClick={() => setInfoPopupContent(INFO_COPY.thinkingQuality)}
                  onToggle={() => {
                    if (!thinkingQuality?.mapping?.reasoning_required) {
                      void onUpdateInputSettings({ enable_thinking_mode: !thinkingEnabled });
                    }
                  }}
                  onToggleInfoClick={() => setInfoPopupContent(INFO_COPY.thinkingMode)}
                  qualityMapping={thinkingQuality.mapping}
                  qualityOptionId={thinkingQuality.optionId}
                />
              ) : null}

              <AgentMaxContextSettingItem
                checked={enableMaxContextMode}
                onInfoClick={() => setInfoPopupContent(INFO_COPY.maxMode)}
                onToggle={() => {
                  void onUpdateInputSettings({ enable_max_context_mode: !enableMaxContextMode });
                }}
              />

              <AgentModelSelectorItem
                allowCollapse={false}
                expanded
                loading={modelSelectorLoading}
                onExpandedChange={() => {}}
                onInfoClick={() =>
                  setInfoPopupContent({
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
            </div>
          </div>
        </InputOverlayPopup>
      ) : null}

      {showExtraSettings ? (
        <InputOverlayPopup onDismiss={() => setShowExtraSettings(false)} panelClassName="agent-popup-card">
          <div className="agent-popup-scroll">
            <div className="agent-popup-body">
              <AgentMemorySelectorItem
                expanded={showMemoryDropdown}
                memorySelector={memorySelector}
                onExpandedChange={setShowMemoryDropdown}
                onInfoClick={() => setInfoPopupContent(INFO_COPY.memory)}
                onSelectProfile={onSelectMemoryProfile}
              />

              <AgentSimpleToggleSettingItem
                checked={enableMemoryAutoUpdate}
                icon={SaveIcon}
                onInfoClick={() => setInfoPopupContent(INFO_COPY.memoryAutoUpdate)}
                onToggle={() => {
                  void onUpdateInputSettings({ enable_memory_auto_update: !enableMemoryAutoUpdate });
                }}
                title={t('自动保存记忆', 'Auto Save Memory', 'Автосохранение памяти')}
              />

              <AgentActionSettingItem
                icon={SaveIcon}
                onClick={() => {
                  void onRunManualMemoryUpdate();
                  setShowExtraSettings(false);
                }}
                onInfoClick={() => setInfoPopupContent(INFO_COPY.manualMemoryUpdate)}
                title={t('手动更新记忆', 'Update memory now', 'Обновить память сейчас')}
              />

              <AgentSimpleToggleSettingItem
                checked={enableAutoRead}
                icon={HistoryIcon}
                onInfoClick={() => setInfoPopupContent(INFO_COPY.autoRead)}
                onToggle={() => {
                  void onUpdateInputSettings({ enable_auto_read: !enableAutoRead });
                }}
                title={t('自动朗读', 'Auto Read', 'Авточтение')}
              />

              <AgentSimpleToggleSettingItem
                checked={permissionLevel === 'ALLOW'}
                icon={LockIcon}
                onInfoClick={() => setInfoPopupContent(INFO_COPY.autoApprove)}
                onToggle={() => {
                  void onUpdateInputSettings({
                    permission_level: permissionLevel === 'ALLOW' ? 'ASK' : 'ALLOW'
                  });
                }}
                title={t('自动批准', 'Auto-approve', 'Автоподтверждение')}
              />

              <AgentDisableSettingsGroupItem
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
                  setInfoPopupContent(INFO_COPY.disablePreferenceDescription)
                }
                onDisableStreamOutput={() => {
                  void onUpdateInputSettings({ disable_stream_output: !disableStreamOutput });
                }}
                onDisableStreamOutputInfoClick={() => setInfoPopupContent(INFO_COPY.disableStream)}
                onDisableToolsInfoClick={() => setInfoPopupContent(INFO_COPY.disableTools)}
                onExpandedChange={setShowDisableSettingsDropdown}
                onGroupInfoClick={() => setInfoPopupContent(INFO_COPY.disableGroup)}
                onToggleTools={() => {
                  void onUpdateInputSettings({ enable_tools: !enableTools });
                }}
              />
            </div>
          </div>
        </InputOverlayPopup>
      ) : null}

      <AttachmentSelector
        mode="agent"
        onDismiss={() => onAttachmentPanelChange(false)}
        onUploadFiles={(files) => {
          void onUploadFiles(files);
        }}
        visible={attachmentPanelOpen}
      />

      {fullscreenOpen ? (
        <FullscreenInputDialog
          onConfirm={() => setFullscreenOpen(false)}
          onDismiss={() => setFullscreenOpen(false)}
          onValueChange={onMessageInputChange}
          value={messageInput}
        />
      ) : null}

      {infoPopupContent ? (
        <AgentInfoPopup content={infoPopupContent} onDismiss={() => setInfoPopupContent(null)} />
      ) : null}
    </div>
  );
}
