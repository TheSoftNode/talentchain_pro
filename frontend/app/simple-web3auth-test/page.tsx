import { SimpleWeb3AuthTest } from "@/components/test/SimpleWeb3AuthTest";

export default function SimpleWeb3AuthTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Simple Web3Auth Test
        </h1>
        <SimpleWeb3AuthTest />
      </div>
    </div>
  );
}