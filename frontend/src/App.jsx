import { AppProvider } from './context/AppContext';
import Home from './pages/Home';

export default function App() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  );
}
