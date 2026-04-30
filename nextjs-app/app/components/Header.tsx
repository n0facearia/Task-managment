interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <div className="app-header">
      <h1>Task Management App</h1>
      <button id="logout-btn" onClick={onLogout}>Log out</button>
    </div>
  );
}
