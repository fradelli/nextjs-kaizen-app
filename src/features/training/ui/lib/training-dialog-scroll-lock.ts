let activeDialogs = 0;
let originalOverflow = "";

export function lockTrainingDialogScroll(): () => void {
  if (activeDialogs === 0) originalOverflow = document.body.style.overflow;
  activeDialogs++;
  document.body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeDialogs--;
    if (activeDialogs === 0) document.body.style.overflow = originalOverflow;
  };
}
