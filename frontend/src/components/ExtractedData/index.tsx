import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailsGrid } from "./DetailsGrid";
import { LineItems } from "./LineItems";

export const ExtractedData = (): React.ReactNode => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Extracted Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DetailsGrid />
        <LineItems />
      </CardContent>
    </Card>
  );
};

export { DetailsGrid } from "./DetailsGrid";
export { LineItems } from "./LineItems";
