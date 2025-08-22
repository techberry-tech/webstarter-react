import type { SearchFlightResultItem } from "@/types/flight-booking";
import { Table, Text } from "@mantine/core";

interface SearchFlightTableProps {
  data: SearchFlightResultItem[] | undefined;
}

export default function SearchFlightTable({ data = [] }: SearchFlightTableProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  const rows = (data || []).map((item, index) => (
    <Table.Tr key={`row-${index}`}>
      <Table.Td>{item.flightNumber}</Table.Td>
      <Table.Td>{item.dayOfWeek}</Table.Td>
      <Table.Td>{item.departTime}</Table.Td>
      <Table.Td>{item.arrivalTime}</Table.Td>
      <Table.Td>{item.price}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div className="mt-3">
      <h1 className="text-lg font-semibold">Search Result</h1>
      {!hasData ? (
        <Text c="dimmed" size="sm" mt="xs">
          No results
        </Text>
      ) : (
        <Table striped horizontalSpacing="md" verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Flight Number</Table.Th>
              <Table.Th>Day of Week</Table.Th>
              <Table.Th>Depart Time</Table.Th>
              <Table.Th>Arrival Time</Table.Th>
              <Table.Th>Price</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </div>
  );
}
