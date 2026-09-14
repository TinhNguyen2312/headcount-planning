import { type ThemeConfig, theme } from "antd"

const PRIMARY = "#2db34b"
const PRIMARY_DARK = "#259b40"
const PRIMARY_BG = "#eaf8ed"
const PRIMARY_BG_SOFT = "#f0fdf4"

const TEXT_MAIN = "#1e293b"
const TEXT_BODY = "#334155"
const TEXT_MUTED = "#64748b"
const TEXT_SUBTLE = "#94a3b8"

const BG_PAGE = "#f7f9fb"
const BG_CARD = "#ffffff"
const BG_MUTED = "#f1f5f9"
const BG_HOVER = "#f8fafc"

const BORDER = "#e2e8f0"

const SHADOW_XS = "0 1px 2px 0 rgb(0 0 0 / 0.05)"
const SHADOW_SM =
  "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)"
const SHADOW_MD =
  "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)"
const SHADOW_LG =
  "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)"

const R = 6
const R_LG = 8
const R_XL = 12
const H = 36

interface Palette {
  border: string
  muted: string
  mutedForeground: string
  accent: string
  bg: string
  card: string
  hover: string
  text: string
  textHeading: string
  textMuted: string
  textSubtle: string
}

const LIGHT: Palette = {
  border: BORDER,
  muted: BG_MUTED,
  mutedForeground: TEXT_MUTED,
  accent: PRIMARY_BG,
  bg: BG_PAGE,
  card: BG_CARD,
  hover: BG_HOVER,
  text: TEXT_BODY,
  textHeading: TEXT_MAIN,
  textMuted: TEXT_MUTED,
  textSubtle: TEXT_SUBTLE,
}

const DARK: Palette = {
  border: "#2b352f",
  muted: "#1b1f1d",
  mutedForeground: "#9ca3af",
  accent: "#23422d",
  bg: "#0f1311",
  card: "#171c19",
  hover: "#1e2420",
  text: "#e2e8f0",
  textHeading: "#f3f4f6",
  textMuted: "#9ca3af",
  textSubtle: "#6b7280",
}

const SHARED_TOKENS: ThemeConfig["token"] = {
  colorPrimary: PRIMARY,
  colorError: "#ef4444",
  colorWarning: "#f59e0b",
  colorSuccess: PRIMARY,
  colorInfo: "#3b82f6",

  fontFamily:
    '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontSize: 14,
  fontSizeSM: 13,
  fontSizeLG: 15,
  lineHeight: 1.5714,

  fontSizeHeading1: 30,
  fontSizeHeading2: 24,
  fontSizeHeading3: 18,
  fontSizeHeading4: 16,
  fontSizeHeading5: 14,
  fontWeightStrong: 600,

  borderRadius: R,
  borderRadiusSM: 4,
  borderRadiusLG: R_LG,
  borderRadiusXS: 2,

  controlHeight: H,
  controlHeightSM: 28,
  controlHeightLG: 42,
  controlOutlineWidth: 2,

  padding: 16,
  paddingSM: 12,
  paddingLG: 20,
  paddingXS: 8,
  paddingXXS: 4,
  margin: 16,
  marginSM: 12,
  marginLG: 20,
  marginXS: 8,
  marginXXS: 4,

  boxShadow: SHADOW_SM,
  boxShadowSecondary: SHADOW_MD,
  boxShadowTertiary: SHADOW_XS,

  motionDurationFast: "0.1s",
  motionDurationMid: "0.15s",
  motionDurationSlow: "0.2s",
}

function buildComponents(p: Palette): ThemeConfig["components"] {
  return {
    Button: {
      controlHeight: H,
      controlHeightSM: 28,
      controlHeightLG: 42,
      borderRadius: R,
      borderRadiusSM: 4,
      borderRadiusLG: R_LG,
      fontWeight: 500,
      paddingInline: 16,
      paddingInlineSM: 10,
      paddingInlineLG: 20,
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
    },
    FloatButton: {
      borderRadiusSM: R,
    },
    Typography: {
      titleMarginBottom: "0.4em",
      titleMarginTop: "0",
    },
    Divider: {
      colorSplit: p.border,
    },
    Layout: {
      headerBg: p.card,
      siderBg: "#002b60",
      bodyBg: p.bg,
      headerHeight: 56,
      headerPadding: "0 24px",
      footerBg: p.bg,
    },
    Breadcrumb: {
      fontSize: 13,
      separatorColor: p.textSubtle,
      itemColor: p.textMuted,
      lastItemColor: p.textHeading,
      linkColor: p.textMuted,
      linkHoverColor: p.text,
      iconFontSize: 13,
    },
    Dropdown: {
      borderRadiusLG: R_LG,
      borderRadiusSM: R,
      paddingBlock: 4,
      controlItemBgHover: p.muted,
      controlItemBgActive: p.accent,
      controlItemBgActiveHover: "#d7f5df",
      boxShadow: SHADOW_LG,
      zIndexPopup: 1050,
    },
    Menu: {
      itemBorderRadius: R,
      subMenuItemBorderRadius: R,
      itemHeight: 36,
      collapsedWidth: 60,
      iconSize: 16,
      iconMarginInlineEnd: 10,
      itemSelectedBg: "rgba(45, 179, 75, 0.15)",
      itemSelectedColor: "#7ede96",
      itemHoverBg: "rgba(255, 255, 255, 0.08)",
      itemHoverColor: "#ffffff",
      itemColor: "rgba(255, 255, 255, 0.75)",
      itemActiveBg: "rgba(45, 179, 75, 0.2)",
      subMenuItemBg: "transparent",
      groupTitleColor: "rgba(255, 255, 255, 0.4)",
      groupTitleFontSize: 11,
      horizontalItemHoverColor: PRIMARY,
      horizontalItemSelectedColor: PRIMARY,
    },
    Pagination: {
      itemSize: 32,
      itemActiveBg: PRIMARY_BG,
      borderRadius: R,
    },
    Steps: {
      borderRadius: R,
      iconSize: 28,
      customIconSize: 28,
      descriptionMaxWidth: 160,
    },
    Tabs: {
      itemColor: p.mutedForeground,
      itemHoverColor: p.text,
      itemSelectedColor: PRIMARY,
      horizontalItemPadding: "10px 16px",
      horizontalItemPaddingLG: "12px 16px",
      horizontalItemGutter: 24,
      inkBarColor: PRIMARY,
      titleFontSize: 14,
      cardBg: p.muted,
      cardGutter: 2,
      cardPadding: "8px 14px",
      cardHeight: 36,
      borderRadius: R,
    },
    Anchor: {
      colorPrimary: PRIMARY,
    },
    Form: {
      labelFontSize: 13,
      labelColor: p.text,
      labelColonMarginInlineStart: 2,
      labelColonMarginInlineEnd: 8,
      itemMarginBottom: 20,
      verticalLabelPadding: "0 0 4px",
    },
    Input: {
      controlHeight: H,
      controlHeightSM: 28,
      controlHeightLG: 42,
      borderRadius: R,
      borderRadiusSM: 4,
      borderRadiusLG: R_LG,
      paddingInline: 12,
      paddingInlineSM: 8,
      paddingInlineLG: 14,
      activeShadow: "0 0 0 3px rgb(45 179 75 / 0.15)",
    },
    InputNumber: {
      controlHeight: H,
      controlHeightSM: 28,
      controlHeightLG: 42,
      borderRadius: R,
      paddingInline: 12,
      activeShadow: "0 0 0 3px rgb(45 179 75 / 0.15)",
    },
    Select: {
      controlHeight: H,
      controlHeightSM: 28,
      controlHeightLG: 42,
      borderRadius: R,
      borderRadiusSM: 4,
      borderRadiusLG: R_LG,
      optionSelectedBg: PRIMARY_BG,
      optionSelectedColor: "#15803d",
      optionActiveBg: p.muted,
      optionFontSize: 14,
      optionHeight: 34,
      optionPadding: "5px 12px",
      multipleItemBg: p.muted,
      multipleItemBorderColor: "transparent",
      multipleItemHeight: 24,
    },
    Cascader: {
      borderRadius: R,
      controlWidth: 180,
      optionSelectedBg: PRIMARY_BG,
    },
    Checkbox: {
      borderRadiusSM: 4,
      controlInteractiveSize: 16,
    },
    Radio: {
      buttonCheckedBg: PRIMARY_BG,
      buttonColor: p.textMuted,
      radioSize: 16,
      dotSize: 8,
    },
    Switch: {
      trackHeight: 22,
      trackMinWidth: 44,
      handleSize: 16,
      handleShadow: "none",
      trackPadding: 2,
      innerMaxMargin: 24,
      innerMinMargin: 6,
    },
    Slider: {
      railBg: p.muted,
      railHoverBg: p.border,
      trackBg: PRIMARY,
      trackHoverBg: PRIMARY_DARK,
      handleColor: PRIMARY,
      handleActiveColor: PRIMARY_DARK,
      dotBorderColor: p.border,
      dotActiveBorderColor: PRIMARY,
      railSize: 4,
    },
    DatePicker: {
      controlHeight: H,
      controlHeightSM: 28,
      controlHeightLG: 42,
      borderRadius: R,
      borderRadiusSM: 4,
      borderRadiusLG: R_LG,
      paddingInline: 12,
      cellHoverBg: p.muted,
      cellActiveWithRangeBg: PRIMARY_BG_SOFT,
      activeShadow: "0 0 0 3px rgb(45 179 75 / 0.15)",
    },
    Upload: {
      borderRadiusLG: R_LG,
      actionsColor: p.textMuted,
    },
    ColorPicker: {
      borderRadius: R,
      controlHeight: H,
    },
    Mentions: {
      controlHeight: H,
      borderRadius: R,
    },
    Rate: {
      starSize: 18,
      starColor: "#f59e0b",
    },
    TreeSelect: {
      borderRadius: R,
      controlHeight: H,
      nodeSelectedBg: PRIMARY_BG,
      nodeHoverBg: p.muted,
    },
    Transfer: {
      borderRadius: R,
      headerHeight: 40,
      itemHeight: 34,
    },
    Table: {
      headerBg: p.muted,
      headerColor: p.mutedForeground,
      headerSplitColor: "transparent",
      headerSortActiveBg: p.border,
      headerSortHoverBg: p.hover,
      rowHoverBg: p.hover,
      rowSelectedBg: PRIMARY_BG_SOFT,
      rowSelectedHoverBg: PRIMARY_BG,
      bodySortBg: p.hover,
      borderColor: p.border,
      cellPaddingBlock: 13,
      cellPaddingInline: 16,
      cellPaddingBlockSM: 8,
      cellPaddingInlineSM: 12,
      headerBorderRadius: R,
      fixedHeaderSortActiveBg: p.muted,
      expandIconBg: p.card,
      footerBg: p.muted,
      footerColor: p.textMuted,
    },
    Avatar: {
      borderRadius: R,
      containerSize: 36,
      containerSizeSM: 28,
      containerSizeLG: 44,
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      groupOverlapping: -8,
    },
    Badge: {
      borderRadius: 10,
      fontSize: 11,
    },
    Card: {
      colorBorderSecondary: p.border,
      borderRadiusLG: R_LG,
      paddingLG: 20,
      headerFontSize: 15,
      headerFontSizeSM: 14,
      headerHeight: 48,
      headerHeightSM: 40,
      tabsMarginBottom: 0,
      boxShadowTertiary: SHADOW_SM,
    },
    Collapse: {
      borderRadiusLG: R_LG,
      headerBg: p.muted,
      contentBg: p.card,
      contentPadding: "16px 20px",
      headerPadding: "12px 20px",
      headerPaddingSM: "8px 16px",
    },
    Descriptions: {
      labelBg: p.muted,
      borderRadiusLG: R_LG,
      itemPaddingBottom: 12,
    },
    List: {
      colorSplit: p.border,
      itemPadding: "12px 0",
      itemPaddingSM: "8px 16px",
      itemPaddingLG: "16px 24px",
      borderRadiusLG: R_LG,
    },
    Popover: {
      borderRadiusLG: R_LG,
      borderRadiusSM: R,
      boxShadow: SHADOW_LG,
    },
    Segmented: {
      borderRadius: R,
      borderRadiusSM: 4,
      borderRadiusLG: R_LG,
      trackPadding: 2,
      trackBg: p.muted,
      itemColor: p.textMuted,
      itemHoverColor: p.text,
      itemSelectedBg: p.card,
      itemSelectedColor: p.textHeading,
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 28,
    },
    Tag: {
      defaultBg: p.muted,
      defaultColor: p.text,
      borderRadiusSM: 4,
      fontSizeSM: 12,
    },
    Timeline: {
      tailColor: p.border,
      tailWidth: 2,
      dotBorderWidth: 2,
      itemPaddingBottom: 20,
    },
    Tooltip: {
      colorBgSpotlight: "#1e293b",
      colorTextLightSolid: "#f3f4f6",
      borderRadius: R,
      boxShadow: SHADOW_MD,
      zIndexPopup: 1060,
      fontSize: 13,
    },
    Tree: {
      titleHeight: 32,
      indentSize: 22,
      nodeSelectedBg: PRIMARY_BG,
      nodeHoverBg: p.muted,
      borderRadius: R,
      directoryNodeSelectedBg: PRIMARY_BG,
      directoryNodeSelectedColor: "#15803d",
    },
    Progress: {
      defaultColor: PRIMARY,
      remainingColor: p.muted,
      lineBorderRadius: 999,
    },
    Calendar: {
      fullBg: p.card,
      fullPanelBg: p.card,
      itemActiveBg: PRIMARY_BG,
      borderRadius: R_LG,
    },
    Carousel: {
      dotWidth: 16,
      dotHeight: 3,
      dotActiveWidth: 24,
    },
    Image: {
      previewOperationColor: "#ffffff",
    },
    QRCode: {
      borderRadiusLG: R_LG,
    },
    Tour: {
      borderRadiusLG: R_XL,
      boxShadow: SHADOW_LG,
    },
    Splitter: {
      splitBarSize: 2,
    },
    Alert: {
      borderRadiusLG: R,
      defaultPadding: "10px 16px",
      withDescriptionPadding: "16px",
      withDescriptionIconSize: 18,
    },
    Drawer: {
      borderRadiusLG: 0,
      paddingLG: 24,
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
    },
    Message: {
      borderRadiusLG: R_LG,
      boxShadow: SHADOW_MD,
      zIndexPopup: 1010,
      contentBg: p.card,
    },
    Modal: {
      borderRadiusLG: R_XL,
      boxShadow: SHADOW_LG,
      paddingMD: 24,
      paddingContentHorizontalLG: 24,
      headerBg: p.card,
      footerBg: p.card,
      titleFontSize: 16,
      titleLineHeight: 1.5,
    },
    Notification: {
      borderRadiusLG: R_LG,
      boxShadow: SHADOW_LG,
      paddingMD: 16,
      paddingContentHorizontalLG: 20,
      zIndexPopup: 1010,
      width: 360,
    },
    Popconfirm: {
      borderRadiusLG: R_LG,
      boxShadow: SHADOW_LG,
      zIndexPopup: 1060,
    },
    Result: {
      iconFontSize: 56,
      titleFontSize: 22,
      subtitleFontSize: 14,
      extraMargin: "24px 0 0",
    },
    Skeleton: {
      gradientFromColor: p.muted,
      gradientToColor: p.border,
      borderRadius: R,
      blockRadius: R,
      paragraphLiHeight: 22,
      titleHeight: 22,
    },
    Spin: {
      dotSize: 32,
      dotSizeSM: 14,
      dotSizeLG: 40,
    },
  }
}

export function getAntdTheme(isDark: boolean): ThemeConfig {
  const p = isDark ? DARK : LIGHT

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: isDark
      ? {
          ...SHARED_TOKENS,
          colorBgBase: DARK.bg,
          colorBgContainer: DARK.card,
          colorBgLayout: DARK.bg,
          colorBgElevated: "#1d2420",
          colorBorder: DARK.border,
          colorBorderSecondary: DARK.border,
          colorText: DARK.text,
          colorTextHeading: DARK.textHeading,
          colorTextSecondary: DARK.textMuted,
          colorTextTertiary: DARK.textSubtle,
          colorTextQuaternary: "#4b5563",
          colorFill: DARK.muted,
          colorFillSecondary: "#1e2420",
          colorFillTertiary: DARK.card,
          colorFillQuaternary: "#141918",
        }
      : {
          ...SHARED_TOKENS,
          colorBgBase: LIGHT.bg,
          colorBgContainer: LIGHT.card,
          colorBgLayout: LIGHT.bg,
          colorBgElevated: LIGHT.card,
          colorBorder: LIGHT.border,
          colorBorderSecondary: LIGHT.border,
          colorText: LIGHT.text,
          colorTextHeading: LIGHT.textHeading,
          colorTextSecondary: LIGHT.textMuted,
          colorTextTertiary: LIGHT.textSubtle,
          colorTextQuaternary: "#cbd5e1",
          colorFill: LIGHT.muted,
          colorFillSecondary: BG_HOVER,
          colorFillTertiary: BG_PAGE,
          colorFillQuaternary: "#f8fafc",
        },
    components: buildComponents(p),
  }
}
