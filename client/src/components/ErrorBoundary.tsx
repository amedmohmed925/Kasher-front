import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

/**
 * Global safety boundary. Production users see a safe recovery message;
 * implementation details remain in the console for debugging without leaking
 * stack traces into the rendered UI.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("Kasher UI error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f4ee] p-8 text-[#172433]">
        <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-[#e9e3d9] bg-[#fffdfa] p-8 text-center shadow-sm">
          <AlertTriangle size={48} className="mb-6 text-[#b96f4a]" aria-hidden="true" />
          <h2 className="mb-3 text-xl font-bold">حدث خطأ غير متوقع</h2>
          <p className="mb-6 text-sm leading-6 text-[#77736f]">تعذر عرض هذه الصفحة. أعد تحميل التطبيق للمتابعة.</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-xl bg-[#172433] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#263b4b]">
            <RotateCcw size={16} aria-hidden="true" /> إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
