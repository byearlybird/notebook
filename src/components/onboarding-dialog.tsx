import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { SignIn, useAuth } from "@clerk/react";
import { useStore } from "@nanostores/react";
import { AccentPicker } from "./accent-picker";
import { Button } from "./shared/button";
import { ThemePicker } from "./theme-picker";
import { Think } from "@/content/think";
import { $userSettings } from "@/stores/user-settings";
import clsx from "clsx";

const TOTAL_STEPS = 4;

export function OnboardingDialog() {
  const settings = useStore($userSettings);
  const { isSignedIn } = useAuth();
  const [step, setStep] = useState(1);

  const open = !settings.onboarded;

  function complete() {
    $userSettings.set({ ...$userSettings.get(), onboarded: true });
  }

  useEffect(() => {
    if (step === 4 && isSignedIn) complete();
  }, [step, isSignedIn]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Viewport className="fixed inset-0 flex items-end sm:items-start justify-center sm:pt-[15vh] p-0 sm:p-4">
          <Dialog.Popup className="flex flex-col w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-surface outline outline-border p-6 min-h-2/3 sm:min-h-0 max-h-[90vh] sm:max-h-[84vh] overflow-auto data-starting-style:translate-y-4 sm:data-starting-style:translate-y-0 sm:data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:translate-y-4 sm:data-ending-style:translate-y-0 sm:data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-200 ease-out">
            <ProgressBar step={step} />
            {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
            {step === 2 && <ThemeStep onNext={() => setStep(3)} />}
            {step === 3 && <BackupStep onNext={() => setStep(4)} />}
            {step === 4 && <SignInStep onSkip={complete} />}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div className="h-1 w-full rounded-full bg-foreground/10 overflow-hidden mb-6">
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StepHeader({
  title,
  description,
  hero = false,
}: {
  title: string;
  description: string;
  hero?: boolean;
}) {
  return (
    <div className="mb-6">
      <Dialog.Title
        className={clsx(
          "text-lg text-foreground",
          hero === true && "font-semibold font-serif text-center",
          hero === false && "font-medium",
        )}
      >
        {title}
      </Dialog.Title>
      <Dialog.Description
        className={clsx(
          "text-sm text-foreground-muted mt-2 leading-relaxed",
          hero && "text-center",
        )}
      >
        {description}
      </Dialog.Description>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader
        hero
        title="Welcome to Journal"
        description="A quiet place for notes, tasks, and intentions. Let's get you set up in a few quick steps."
      />
      <div className="flex-1 flex items-center justify-center text-foreground">
        <Think aria-hidden className="size-60" />
      </div>
      <Button className="w-full" onClick={onNext}>
        Get started
      </Button>
    </div>
  );
}

function ThemeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader
        title="Make it yours"
        description="Pick a theme and accent color. You can change both later in Settings."
      />
      <div className="space-y-6 mb-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Appearance</h3>
          <ThemePicker />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Accent color</h3>
          <AccentPicker />
        </div>
      </div>
      <Button className="w-full mt-auto" onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}

function BackupStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader
        title="Your entries live on this device"
        description="Journal keeps everything local by default. If you want to sync across devices or protect against losing your phone, you can back up to an end-to-end encrypted vault — only you can read it."
      />
      <Button className="w-full mt-auto" onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}

function SignInStep({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader
        title="Back up your journal"
        description="Sign in to keep your entries safe and access them anywhere. Your data stays end-to-end encrypted."
      />
      <div className="flex justify-center mb-4">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none border-none",
            },
          }}
        />
      </div>
      <Button variant="secondary" className="w-full mt-auto" onClick={onSkip}>
        Not now
      </Button>
    </div>
  );
}
