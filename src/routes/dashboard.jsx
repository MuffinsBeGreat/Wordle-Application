import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import GooeyNav from "@/components/GooeyNav";

export default function Dashboard() {
  const nav = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    nav("/");
  }

  const items = [
    { label: "Search", href: "/search" },
    { label: "Logout", href: "/", onClick: handleLogout }
  ];
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <GooeyNav
          items={items}
          particleCount={15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={0}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
        />
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <Card className="p-4 space-y-3">
        <p>Select a Wordle mode:</p>

        <div className="grid grid-cols-3 gap-2">
          {[3, 4, 5, 6, 7].map(n => (
            <Button key={n} asChild>
              <Link to={`/wordle/${n}`}>{n}-Letter</Link>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
