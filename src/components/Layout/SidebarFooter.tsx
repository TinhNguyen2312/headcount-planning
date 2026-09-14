export const SidebarFooter = ({
  collapsed = false,
}: {
  collapsed?: boolean
}) => {
  return (
    <div className="border-t border-sidebar-border/40 px-2 pt-2 text-center text-[10px] text-white/50 select-none">
      {!collapsed ? (
        <>
          <div>Version 1.0.0</div>
          <div>© 2026 Nova Group</div>
        </>
      ) : (
        <div>v1.0</div>
      )}
    </div>
  )
}
