import { Card, CardContent } from "@/components/ui/card";
import { Counter } from "./Counter";

interface CountCardProps {
  lotteryCount: number;
}

interface PayoutCardProps {
  totalPayout: string; // This will be a string representing the ETH amount
}

export function CountStatsCard({ lotteryCount }: CountCardProps) {
  return (
    <Card className="w-60 text-center bg-highlight shadow-blue-500 shadow-md">
      <CardContent className="p-6">
        <Counter from={0} to={lotteryCount || 0} duration={3} />
        <p className="text-lg font-roboto font-medium mt-1">Lotteries Run</p>
      </CardContent>
    </Card>
  );
}

export function PayoutStatsCard({ totalPayout }: PayoutCardProps) {
  // Convert the totalPayout string to a number (float) for the counter
  const payoutAmount = totalPayout ? parseFloat(totalPayout) : 0;

  return (
    <Card className="w-60 text-center bg-highlight shadow-purple-500 shadow-md">
      <CardContent className="p-6">
        <Counter from={0} to={payoutAmount} duration={3} />
        <p className="text-lg font-roboto font-medium mt-1">ETH Paid Out</p>
      </CardContent>
    </Card>
  );
}
