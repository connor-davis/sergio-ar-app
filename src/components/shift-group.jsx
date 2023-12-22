import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiUrl from "../lib/apiUrl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { DropdownMenu } from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  format,
  getDaysInMonth,
  getMonth,
  getYear,
  monthsInYear,
  parse,
} from "date-fns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import ImportDataModal from "./modals/import-data";
import ExportDataModal from "./modals/export-data";

export default function ShiftGroup(
  columns = [
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("shift")}</div>
      ),
    },
  ]
) {
  const [shiftGroups, setShiftGroups] = useState([]);

  const { shift_group } = useParams();
  const [data, setData] = useState([]);

  const [years, setYears] = useState(
    Array.from({ length: 10 }, (_, i) => i + 2023)
  );
  const [months, setMonths] = useState([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);

  const [selectedMonth, setSelectedMonth] = useState(
    months[getMonth(new Date())]
  );
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    const disposeableTimeout = setTimeout(async () => {
      await getSchedules();
    }, 100);

    return () => {
      clearTimeout(disposeableTimeout);
    };
  }, [shift_group, selectedMonth, selectedYear]);

  useEffect(() => {
    const disposeableTimeout = setTimeout(async () => {
      await getShiftGroups();
    }, 100);

    return () => {
      clearTimeout(disposeableTimeout);
    };
  }, []);

  const getSchedules = async () => {
    const shiftGroupResponse = await axios.get(
      apiUrl + `/schedules?shift_group=${shift_group}`
    );

    if (shiftGroupResponse.status === 200) {
      setData(
        shiftGroupResponse.data.schedules.filter((schedule) => {
          let start_date = new Date(schedule.start_date);
          let end_date = new Date(schedule.end_date);

          return (
            months[start_date.getMonth()] === selectedMonth &&
            start_date.getFullYear() === selectedYear
          );
        })
      );
    }
  };

  const getShiftGroups = async () => {
    const shiftGroupsResponse = await axios.get(apiUrl + "/shift-groups");

    if (shiftGroupsResponse.status === 200) {
      setShiftGroups(
        shiftGroupsResponse.data.shift_groups.sort((a, b) => {
          return a.shift_group.localeCompare(b.shift_group);
        })
      );
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-3 overflow-hidden">
      <Card className="w-full h-auto p-3 space-x-3">
        <ImportDataModal
          onDataImported={() => {
            getShiftGroups();
          }}
        />
        <ExportDataModal shiftGroups={shiftGroups} />
      </Card>

      <Card className="w-full h-full p-3 space-y-3 overflow-hidden">
        <div className="flex flex-col w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">{shift_group}</div>
            <div className="flex items-center space-x-3">
              <Popover open={monthOpen} onOpenChange={setMonthOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={monthOpen}
                    className="w-[200px] justify-between"
                  >
                    {selectedMonth
                      ? months.find((month) => month === selectedMonth)
                      : "Select month..."}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search month..." />
                    <CommandEmpty>No month found.</CommandEmpty>
                    <CommandGroup>
                      {months.map((month) => (
                        <CommandItem
                          key={month}
                          value={month}
                          onSelect={(currentValue) => {
                            setSelectedMonth(
                              currentValue.split("")[0].toUpperCase() +
                                currentValue.substring(1)
                            );
                            setMonthOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMonth === month
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {month}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover open={yearOpen} onOpenChange={setYearOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={yearOpen}
                    className="w-[200px] justify-between"
                  >
                    {selectedYear
                      ? years.find((year) => year === selectedYear)
                      : "Select year..."}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search year..." />
                    <CommandEmpty>No year found.</CommandEmpty>
                    <CommandGroup>
                      {years.map((year) => (
                        <CommandItem
                          key={year}
                          value={year}
                          onSelect={(currentValue) => {
                            setSelectedYear(parseInt(currentValue));
                            setYearOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedYear === year
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {year}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <Tabs defaultValue={1} className="flex flex-col w-full h-full pb-16">
          <div className="flex w-full">
            <TabsList className="justify-start w-full h-auto">
              <div className="flex items-center overflow-y-auto">
                {Array(
                  getDaysInMonth(
                    new Date(`${selectedYear}-${selectedMonth}-01`)
                  )
                )
                  .fill()
                  .map((_, i) => (
                    <TabsTrigger key={i} value={i + 1}>
                      {i + 1}
                    </TabsTrigger>
                  ))}
              </div>
            </TabsList>
          </div>
          {Array(
            getDaysInMonth(new Date(`${selectedYear}-${selectedMonth}-01`))
          )
            .fill()
            .map((_, i) => (
              <TabsContent
                key={i}
                value={i + 1}
                className="w-full h-full overflow-y-auto"
              >
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shift</TableHead>
                        <TableHead>Shift Type</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.filter((schedule) => {
                        let day = parseInt(
                          format(new Date(schedule.start_date), "dd")
                        );

                        return day === i + 1;
                      }).length > 0 ? (
                        data
                          .filter((schedule) => {
                            let day = parseInt(
                              format(new Date(schedule.start_date), "dd")
                            );

                            return day === i + 1;
                          })
                          .map((schedule, index) => (
                            <TableRow key={index}>
                              <TableCell>{schedule.shift}</TableCell>
                              <TableCell>{schedule.shift_type}</TableCell>
                              <TableCell>{schedule.teacher_name}</TableCell>
                              <TableCell>{schedule.start_date}</TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
        </Tabs>
      </Card>
    </div>
  );
}
