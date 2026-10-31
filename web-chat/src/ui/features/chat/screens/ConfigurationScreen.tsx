import { CopyIcon, KeyIcon, LinkIcon } from '../util/chatIcons';
import { t } from '../util/i18n';

export function ConfigurationScreen({
  tokenDraft,
  error,
  suggestedUrl,
  onTokenDraftChange,
  onSubmit,
  onCopyUrl
}: {
  tokenDraft: string;
  error: string | null;
  suggestedUrl: string;
  onTokenDraftChange: (value: string) => void;
  onSubmit: () => void;
  onCopyUrl: () => void;
}) {
  return (
    <div className="chat-connection-overlay">
      <section className="configuration-screen" role="dialog">
        <div className="configuration-screen-header">
          <span>{t('局域网页面连接', 'LAN page connection', 'Подключение к LAN-странице')}</span>
          <h1>{t('输入 Bearer Token', 'Enter Bearer Token', 'Введите Bearer Token')}</h1>
          <p>
            {t(
              '连接后会直接进入手机当前会话，历史、主题和流式回复都与手机保持同步。',
              'Once connected you land in the current conversation on the phone; history, theme and streaming replies stay in sync with it.',
              'После подключения вы попадёте в текущую беседу на телефоне: история, тема и потоковые ответы синхронизируются с ней.'
            )}
          </p>
        </div>

        <div className="configuration-screen-block">
          <label className="configuration-screen-label" htmlFor="web-chat-url">
            <LinkIcon size={16} />
            <span>{t('访问地址', 'Address', 'Адрес')}</span>
          </label>
          <div className="configuration-screen-inline-card">
            <code id="web-chat-url">{suggestedUrl}</code>
            <button onClick={onCopyUrl} type="button">
              <CopyIcon size={16} />
            </button>
          </div>
        </div>

        <div className="configuration-screen-block">
          <label className="configuration-screen-label" htmlFor="web-chat-token">
            <KeyIcon size={16} />
            <span>Bearer Token</span>
          </label>
          <input
            id="web-chat-token"
            onChange={(event) => onTokenDraftChange(event.target.value)}
            placeholder={t(
              '输入设置页里显示的 Token',
              'Enter the token shown on the settings page',
              'Введите токен, показанный на странице настроек'
            )}
            type="password"
            value={tokenDraft}
          />
        </div>

        {error ? <div className="chat-inline-error is-card-error">{error}</div> : null}

        <button className="configuration-screen-submit" onClick={onSubmit} type="button">
          {t('连接网页聊天', 'Connect web chat', 'Подключить веб-чат')}
        </button>
      </section>
    </div>
  );
}
