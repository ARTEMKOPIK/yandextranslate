import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to main process
    if (window.api?.logError) {
      window.api.logError(error.message, 'ErrorBoundary', {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Произошла ошибка
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                К сожалению, в приложении произошла непредвиденная ошибка.
              </p>
            </div>

            {isDev && this.state.error && (
              <div className="mb-6">
                <details className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                    Детали ошибки (только для разработки)
                  </summary>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Сообщение:
                      </div>
                      <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Stack trace:
                        </div>
                        <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Component stack:
                        </div>
                        <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={this.handleReload}>
                Перезагрузить приложение
              </Button>
              <Button variant="secondary" onClick={this.handleReset}>
                Попробовать снова
              </Button>
            </div>

            <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
              Если проблема повторяется, проверьте логи приложения в настройках.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
