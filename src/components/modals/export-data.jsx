import { CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import apiUrl from "../../lib/apiUrl";
import axios from "axios";
import { cn } from "../../lib/utils";

export default function ExportDataModal() {
  const [shiftGroups, setShiftGroups] = useState([]);

  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const [error, setError] = useState(undefined);

  const [selectedGroups, setSelectedGroups] = useState([]);

  const [selectGroupOpen, setSelectGroupOpen] = useState(false);

  useEffect(() => {
    const disposeableTimeout = setTimeout(async () => {
      const shiftGroupsResponse = await axios.get(apiUrl + "/shift-groups");

      if (shiftGroupsResponse.status === 200) {
        setShiftGroups(
          shiftGroupsResponse.data.shift_groups
            .sort((a, b) => {
              return a.shift_group.localeCompare(b.shift_group);
            })
            .map(({ shift_group }) => shift_group)
        );
      }
    }, 100);

    return () => {
      clearTimeout(disposeableTimeout);
    };
  }, []);

  const exportSelectedGroups = async () => {
    setError(undefined);

    if (selectedGroups.length === 0) {
      setError("You must select at least one group.");
      setExporting(false);
      return;
    }

    setExporting(true);

    for (const group of selectedGroups) {
      await exportData(group);
    }

    setTimeout(() => {
      setExporting(false);
      setExported(true);

      setTimeout(() => {
        setExported(false);
      }, 5000);
    }, 3000);
  };

  const exportData = async (shiftGroup) => {
    axios
      .get(
        apiUrl +
          "/generate-efficiency-report?start_date=" +
          format(date.from, "yyyy-MM-dd") +
          "&end_date=" +
          format(date.to, "yyyy-MM-dd") +
          "&shift_group=" +
          shiftGroup,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = shiftGroup + "-efficiency-report.csv";

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      })
      .catch((error) => {
        setError(error.message);
      });

    axios
      .get(
        apiUrl +
          "/generate-consolidated-report?start_date=" +
          format(date.from, "yyyy-MM-dd") +
          "&end_date=" +
          format(date.to, "yyyy-MM-dd") +
          "&shift_group=" +
          shiftGroup,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = shiftGroup + "-consolidated-report.csv";

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Export Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Export Data</DialogTitle>
          {!error ? (
            <DialogDescription>
              Please select the date range you would like to export as well as
              the group/s you would like to export.
            </DialogDescription>
          ) : (
            <DialogDescription className="text-red-600">
              {error}
            </DialogDescription>
          )}
        </DialogHeader>
        {!exporting && !exported && (
          <div className="flex flex-col w-full h-auto space-y-5">
            <div className="flex flex-col w-full h-auto space-y-3">
              <div className="text-lg font-semibold">Export Date Range</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedGroups.length > 0 && (
              <div className="flex flex-col w-full h-auto space-y-3">
                <div className="text-lg font-semibold">Selected Groups</div>
                <Card className="grid w-full h-auto grid-cols-3 gap-3 p-1 bg-neutral-100">
                  {selectedGroups.length > 0 &&
                    selectedGroups.map((group) => (
                      <Badge
                        key={group}
                        variant="outline"
                        className="h-6 p-1 break-all truncate bg-white"
                      >
                        <Button
                          variant="ghost"
                          className="w-5 h-5 p-1"
                          onClick={() =>
                            setSelectedGroups([
                              ...selectedGroups.filter(
                                (ogroup) => ogroup !== group
                              ),
                            ])
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        {group}
                      </Badge>
                    ))}
                </Card>
              </div>
            )}

            <div className="flex flex-col w-full h-auto space-y-3">
              <div className="text-lg font-semibold">Select New Group</div>
              <Popover open={selectGroupOpen} onOpenChange={setSelectGroupOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={selectGroupOpen}
                    className="justify-between w-full"
                  >
                    Select group...
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search group..." />
                    <CommandEmpty>No group found.</CommandEmpty>
                    <CommandGroup className="flex flex-col h-[200px] overflow-y-auto">
                      {shiftGroups instanceof Array &&
                        shiftGroups.map((group) => (
                          <CommandItem
                            key={group}
                            value={group}
                            onSelect={(currentValue) => {
                              setSelectedGroups([
                                ...selectedGroups.filter(
                                  (group) =>
                                    group.toLowerCase() !== currentValue
                                ),
                                shiftGroups.find(
                                  (group) =>
                                    group.toLowerCase() === currentValue
                                ),
                              ]);
                              setSelectGroupOpen(false);
                            }}
                          >
                            {group}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
        {exporting && (
          <div className="w-full text-center">Exporting data...</div>
        )}
        {!exporting && exported && (
          <div className="grid w-full h-auto grid-cols-2 gap-3">
            Data has been exported. Find the corresponding export reports in
            your downloads folder.
          </div>
        )}
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => exportSelectedGroups()}
            disabled={exporting || exported}
          >
            Begin Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
