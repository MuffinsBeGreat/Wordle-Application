import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <Card className="p-4 space-y-3">
        <p>Select a Wordle mode:</p>

        <div className="grid grid-cols-3 gap-2">
          {[3,4,5,6,7].map(n => (
            <Button key={n} asChild>
              <Link to={`/wordle/${n}`}>{n}-Letter</Link>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
