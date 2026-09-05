"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown, Mail, MapPin, Info } from "lucide-react";
import { City, State } from "country-state-city";
import PhoneInput, { type Country as PhoneCountry } from "react-phone-number-input";
import { StepHeader } from "../StepHeader";
import { useApplyStore } from "../useApplyStore";
import { CountrySelect } from "./CountrySelect";
import { SearchableSelect } from "./SearchableSelect";

export default function ContactInformationPage() {
  const router = useRouter();
  const { data, setData, isClient, lastSaved } = useApplyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const states = useMemo(() => State.getStatesOfCountry(data.countryCode), [data.countryCode]);
  const cities = useMemo(
    () => City.getCitiesOfState(data.countryCode, data.provinceCode),
    [data.countryCode, data.provinceCode],
  );
  const cityItems = useMemo(
    () => cities.map((c) => ({ key: c.name, label: c.name })),
    [cities],
  );

  if (!isClient || !mounted) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/apply/employment");
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col h-full justify-between min-h-full">
      <div>
        <StepHeader step={3} totalSteps={9} title="CONTACT INFORMATION" lastSaved={lastSaved} />

        <div className="mt-8 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#171717] mb-4">
            Contact.
          </h1>
          <p className="text-lg text-gray-600 mb-10">Where we send statements & notices.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Home address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={data.homeAddress}
                  onChange={(e) => setData({ homeAddress: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                  placeholder="14 Lansdowne Avenue, Unit 3B"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <CountrySelect
                  value={data.countryCode}
                  onChange={(c) =>
                    setData({
                      country: c.name,
                      countryCode: c.isoCode,
                      province: "",
                      provinceCode: "",
                      city: "",
                    })
                  }
                />
              </div>
              <div />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <div className="relative">
                  <select
                    required
                    disabled={states.length === 0}
                    value={data.provinceCode}
                    onChange={(e) => {
                      const state = states.find((s) => s.isoCode === e.target.value);
                      setData({ province: state?.name ?? "", provinceCode: e.target.value, city: "" });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white appearance-none disabled:bg-gray-50/50 disabled:text-gray-400"
                  >
                    <option value="">
                      {states.length === 0 ? "No states/provinces" : "Select"}
                    </option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                {cityItems.length > 0 ? (
                  <SearchableSelect
                    items={cityItems}
                    value={data.city}
                    onChange={(item) => setData({ city: item.key })}
                    placeholder="Select city"
                    searchPlaceholder="Search city..."
                    disabled={!data.provinceCode}
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={data.city}
                    onChange={(e) => setData({ city: e.target.value })}
                    disabled={!data.provinceCode}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white disabled:bg-gray-50/50 disabled:text-gray-400"
                    placeholder={data.provinceCode ? "Enter your city" : "Select province first"}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
                <input
                  type="text"
                  required
                  value={data.postalCode}
                  onChange={(e) => setData({ postalCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white uppercase"
                  placeholder="M6K 2W5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                <PhoneInput
                  international
                  defaultCountry={(data.countryCode || "NG") as PhoneCountry}
                  value={data.phone}
                  onChange={(value) => setData({ phone: value ?? "" })}
                  className="likemind-phone-input"
                  numberInputProps={{ required: true }}
                  placeholder="(416) 555-0184"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={data.email}
                    onChange={(e) => setData({ email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    placeholder="alex.morgan@gmail.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 p-4 bg-indigo-50/50 text-indigo-800 rounded-xl border border-indigo-100">
              <Info className="w-5 h-5 shrink-0 text-indigo-500 mt-0.5" />
              <p className="text-sm">
                We'll send a verification email after submission. Address changes after activation require a 5-day cooling period.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-gray-200 border-dashed flex items-center justify-between">
        <Link
          href="/apply/basic-information"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#171717] px-6 py-3 rounded-full font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase hidden md:inline-block">
          22% complete
        </span>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          Continue to employment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
