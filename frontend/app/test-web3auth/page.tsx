"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestWeb3AuthPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Web3Auth Test Page</CardTitle>
          <CardDescription>Test page for Web3Auth functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a test page for Web3Auth integration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
