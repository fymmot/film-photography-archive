export function setupDialog(dialogId: string) {
  const dialog = document.querySelector(`#${dialogId}`) as HTMLDialogElement;
  const closeButton = document.querySelector(`#close-${dialogId}`);

  if (dialog && closeButton) {
    closeButton.addEventListener("click", () => {
      dialog.close();
    });

    // Close on click outside
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  }

  return dialog;
} 