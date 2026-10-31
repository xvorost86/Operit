import { t } from '../util/i18n';

export function FullscreenInputDialog({
  value,
  onValueChange,
  onDismiss,
  onConfirm
}: {
  value: string;
  onValueChange: (value: string) => void;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-scrim" role="presentation">
      <div className="fullscreen-input-dialog" role="dialog">
        <header>
          <span>{t('输入扩展', 'Input extension', 'Расширенный ввод')}</span>
          <h3>{t('全屏输入', 'Fullscreen Input', 'Полноэкранный ввод')}</h3>
        </header>
        <textarea onChange={(event) => onValueChange(event.target.value)} value={value} />
        <footer>
          <button onClick={onDismiss} type="button">
            {t('取消', 'Cancel', 'Отмена')}
          </button>
          <button onClick={onConfirm} type="button">
            {t('完成', 'Done', 'Готово')}
          </button>
        </footer>
      </div>
    </div>
  );
}
