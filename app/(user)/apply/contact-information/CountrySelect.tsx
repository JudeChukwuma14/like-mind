"use client";

import { useMemo } from "react";
import { Country, type ICountry } from "country-state-city";
import { SearchableSelect } from "./SearchableSelect";

export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (country: ICountry) => void;
}) {
  const countries = useMemo(() => Country.getAllCountries(), []);
  const items = useMemo(
    () => countries.map((c) => ({ key: c.isoCode, label: c.name, icon: c.flag, raw: c })),
    [countries],
  );

  return (
    <SearchableSelect
      items={items}
      value={value}
      onChange={(item) => onChange(item.raw)}
      placeholder="Select country"
      searchPlaceholder="Search country..."
    />
  );
}
