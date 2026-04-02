import CopilotExampleClient from './CopilotExampleClient';

export default function CopilotPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Copilot Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">Click the floating button in the bottom right corner.</p>
      </div>
      <CopilotExampleClient />
    </div>
  );
}
