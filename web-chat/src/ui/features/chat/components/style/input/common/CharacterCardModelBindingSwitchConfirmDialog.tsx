import { t } from '../../../../util/i18n';

export function CharacterCardModelBindingSwitchConfirmDialog({
  open,
  onConfirm,
  onDismiss
}: {
  open: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-scrim" onClick={onDismiss} role="presentation">
      <div
        className="history-dialog model-selector-confirm-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <h3>
            {t(
              '修改角色卡绑定模型',
              'Change Character Card Bound Model',
              'Смена модели, привязанной к карточке персонажа'
            )}
          </h3>
          <p>
            {t(
              '当前角色卡已绑定对话模型。继续后将修改该角色卡的模型绑定，不会修改全局对话模型配置。',
              'This character card currently has a bound chat model. Continuing will update the model binding of this character card and will not modify the global chat model configuration.',
              'К этой карточке персонажа сейчас привязана модель чата. При продолжении привязка модели этой карточки персонажа будет обновлена, а глобальная конфигурация модели чата не изменится.'
            )}
          </p>
        </header>
        <footer>
          <button onClick={onDismiss} type="button">
            {t('取消', 'Cancel', 'Отмена')}
          </button>
          <button onClick={onConfirm} type="button">
            {t('确认修改', 'Confirm Change', 'Подтвердить изменение')}
          </button>
        </footer>
      </div>
    </div>
  );
}
