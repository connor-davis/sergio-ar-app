import { Card, CardContent } from "./components/ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./components/ui/menubar";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import ExportDataModal from "./components/modals/export-data";
import HomePage from "./home";
import ImportDataModal from "./components/modals/import-data";
import { Input } from "./components/ui/input";
import ShiftGroup from "./components/shift-group";
import apiUrl from "./lib/apiUrl";
import axios from "axios";
import NotFound from "./not-found";

function App() {
  const [shiftGroups, setShiftGroups] = useState([]);
  const [searchShiftGroupValue, setSearchShiftGroupValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const disposeableTimeout = setTimeout(async () => {
      const shiftGroupsResponse = await axios.get(apiUrl + "/shift-groups");

      if (shiftGroupsResponse.status === 200) {
        setShiftGroups(
          shiftGroupsResponse.data.shift_groups
            .filter(({ shift_group }) =>
              shift_group.includes(searchShiftGroupValue)
            )
            .sort((a, b) => {
              return a.shift_group.localeCompare(b.shift_group);
            })
        );
      }
    }, 100);

    return () => {
      clearTimeout(disposeableTimeout);
    };
  }, [searchShiftGroupValue]);

  return (
    <div className="flex flex-col w-screen h-screen p-3 space-y-3 bg-neutral-100">
      <div className="flex w-full h-full space-x-3 overflow-hidden">
        <Card className="h-full w-[600px] p-3 pb-16 space-y-3">
          <Input
            placeholder="Search Shift Group"
            value={searchShiftGroupValue}
            onChange={(event) => setSearchShiftGroupValue(event.target.value)}
          />
          <div className="flex flex-col w-full h-full space-y-3 overflow-y-auto">
            {shiftGroups.map((shiftGroup, index) => (
              <div
                key={index}
                className="flex items-center justify-between w-full h-12 px-3 py-2 space-x-3 rounded-md cursor-pointer hover:bg-neutral-200"
                onClick={() => {
                  navigate(`/${shiftGroup.shift_group}`);
                }}
              >
                <div>{shiftGroup.shift_group}</div>
              </div>
            ))}
          </div>
        </Card>
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route path="/:shift_group" Component={ShiftGroup} />
          <Route path="**" Component={NotFound} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
