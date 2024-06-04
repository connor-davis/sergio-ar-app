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
import NotFound from "./not-found";
import ShiftGroup from "./components/shift-group";
import apiUrl from "./lib/apiUrl";
import axios from "axios";
import Loading from "./components/loading";

function App() {
  const [loading, setLoading] = useState(false);
  const [shiftGroups, setShiftGroups] = useState([]);
  const [searchShiftGroupValue, setSearchShiftGroupValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const disposeableTimeout = setTimeout(async () => {
      setLoading(true);

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

        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(disposeableTimeout);
    };
  }, [searchShiftGroupValue]);

  const getShiftGroups = async () => {
    setLoading(true);

    const shiftGroupsResponse = await axios.get(apiUrl + "/shift-groups");

    if (shiftGroupsResponse.status === 200) {
      setShiftGroups(
        shiftGroupsResponse.data.shift_groups.sort((a, b) => {
          return a.shift_group.localeCompare(b.shift_group);
        })
      );

      setLoading(false);
    }
  };

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
            {loading && (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Loading />
              </div>
            )}

            {!loading &&
              shiftGroups.map((shiftGroup, index) => (
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

        <div className="flex flex-col w-full h-full space-y-3">
          <Card className="w-full h-auto p-3 space-x-3">
            <ImportDataModal
              onDataImported={() => {
                getShiftGroups();
              }}
            />
            <ExportDataModal shiftGroups={shiftGroups} />
          </Card>

          {loading && (
            <Card className="w-full h-full p-3 space-y-3 overflow-hidden">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Loading />
              </div>
            </Card>
          )}

          {!loading && (
            <Routes>
              <Route path="/" Component={HomePage} />
              <Route path="/:shift_group" Component={ShiftGroup} />
              <Route path="*" Component={NotFound} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
