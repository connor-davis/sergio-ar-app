import { Card } from "./components/ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./components/ui/menubar";

function App() {
  return (
    <div className="flex flex-col bg-neutral-100 w-screen h-screen space-y-3 p-3">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Import</MenubarItem>
            <MenubarItem>Export</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="flex w-full h-full space-x-3 overflow-hidden">
        <Card className="w-1/4 h-full overflow-y-auto"></Card>
        <Card className="w-full h-full overflow-y-auto"></Card>
      </div>
    </div>
  );
}

export default App;
