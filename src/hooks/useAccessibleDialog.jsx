import { useCallback, useState } from "react";
import { AccessibleDialog } from "../components/AccessibleDialog";

export function useAccessibleDialog() {
  const [dialog, setDialog] = useState(null);

  const closeDialog = useCallback((result) => {
    setDialog((current) => {
      current?.resolve?.(result);
      return null;
    });
  }, []);

  const alert = useCallback((message, options = {}) => new Promise((resolve) => {
    setDialog({
      type: "alert",
      message,
      title: options.title,
      confirmLabel: options.confirmLabel,
      resolve,
    });
  }), []);

  const confirm = useCallback((message, options = {}) => new Promise((resolve) => {
    setDialog({
      type: "confirm",
      message,
      title: options.title,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      danger: options.danger,
      resolve,
    });
  }), []);

  const prompt = useCallback((message, options = {}) => new Promise((resolve) => {
    setDialog({
      type: "prompt",
      message,
      title: options.title,
      inputLabel: options.inputLabel,
      defaultValue: options.defaultValue || "",
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      resolve,
    });
  }), []);

  const dialogElement = (
    <AccessibleDialog dialog={dialog} onResolve={closeDialog} />
  );

  return { alert, confirm, prompt, dialogElement };
}
