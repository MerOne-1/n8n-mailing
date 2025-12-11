import { Header } from "@/components/Header";
import { LeftColumn } from "@/components/LeftColumn";
import { PdfPreviewSection } from "@/components/PdfPreviewSection";
import { ExtractedData } from "@/components/ExtractedData";
import { AiFindingsSection } from "@/components/AiFindingsSection";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

function App() {
  return (
    <InvoiceProvider>
      <div className="h-screen flex flex-col bg-background">
        <Header />
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
            <LeftColumn />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={75}>
            <main className="h-full overflow-auto">
              <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
                <PdfPreviewSection />
                <ExtractedData />
                <AiFindingsSection />
              </div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </InvoiceProvider>
  );
}

export default App;
