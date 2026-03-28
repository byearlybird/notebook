import { CaretLeftIcon } from "@phosphor-icons/react";
import { SwipeBackEdge } from "../navigation";
import { createContext, use } from "react";

const DetailPageContext = createContext<{
  onGoBack?: () => void;
}>({});

export type DetailPageProps = {
  onGoBack?: () => void;
  children: React.ReactNode;
};

export function DetailPage({ onGoBack, children }: DetailPageProps) {
  return (
    <DetailPageContext.Provider value={{ onGoBack }}>
      <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
        {children}
        {onGoBack && <SwipeBackEdge onBack={onGoBack} />}
      </div>
    </DetailPageContext.Provider>
  );
}

export function DetailPageHeader(props: { children?: React.ReactNode }) {
  const { onGoBack } = use(DetailPageContext);

  return (
    <header className="flex items-center gap-2 px-4 py-2">
      {onGoBack ? (
        <button
          type="button"
          onClick={onGoBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
      ) : (
        <div className="size-10 shrink-0" />
      )}
      {props.children}
    </header>
  );
}

export function DetailPageActions(props: { children?: React.ReactNode }) {
  return <div className="flex items-center gap-2">{props.children}</div>;
}

export function DetailPageTitle({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 text-center">{children}</div>;
}
