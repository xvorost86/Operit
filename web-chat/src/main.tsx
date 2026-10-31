import ReactDOM from 'react-dom/client';
import { AIChatScreen } from './ui/features/chat/screens/AIChatScreen';
import { UI_LANGUAGE_TAG } from './ui/features/chat/util/i18n';
import './ui/features/chat/util/chat-screen.css';

// The page language comes from navigator.language, so index.html cannot carry it.
document.documentElement.lang = UI_LANGUAGE_TAG;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<AIChatScreen />);
