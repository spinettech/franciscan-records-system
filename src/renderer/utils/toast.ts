export const showToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message = ''
) => {
  window.dispatchEvent(new CustomEvent('fsic-toast', { detail: { type, title, message } }))
}
