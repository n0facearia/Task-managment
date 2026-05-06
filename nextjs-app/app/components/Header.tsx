interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-[900px] mb-4">
      <h1 className="text-base font-semibold m-0 text-[var(--accent-color)]">Task Management App</h1>
      <button
        id="logout-btn"
        className="bg-transparent border border-[#333] rounded-lg text-[#666] text-xs font-inherit px-3 py-1.5 transition-all duration-150 hover:border-[#555] hover:text-[#ccc]"
        onClick={onLogout}
      >
        Log out
      </button>
    </div>
  );
}
