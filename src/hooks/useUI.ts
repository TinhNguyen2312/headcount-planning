import { App } from "antd"

const LOADING_KEY = "global-loading"

export const useUI = () => {
  const { message: antMessage } = App.useApp()

  const message = {
    success: (description: string) =>
      antMessage?.success
        ? antMessage.success(description)
        : console.log(description),
    error: (description: string) =>
      antMessage?.error
        ? antMessage.error(description)
        : console.error(description),
    warning: (description: string) =>
      antMessage?.warning
        ? antMessage.warning(description)
        : console.warn(description),
  }

  const showLoading = (description = "Đang xử lý...") => {
    antMessage.open({
      key: LOADING_KEY,
      type: "loading",
      content: description,
      duration: 0,
    })
  }

  const hideLoading = () => {
    antMessage.destroy(LOADING_KEY)
  }
  const showError = (description: string) => {
    message.error(description)
  }

  const showSuccess = (description: string) => {
    message.success(description)
  }

  return { message, showLoading, hideLoading, showError, showSuccess }
}
