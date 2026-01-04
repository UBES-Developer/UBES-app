"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRightLeft } from "lucide-react"

type Category = "length" | "mass" | "temperature" | "pressure"

const UNITS = {
    length: [
        { value: "m", label: "Meters (m)" },
        { value: "km", label: "Kilometers (km)" },
        { value: "cm", label: "Centimeters (cm)" },
        { value: "mm", label: "Millimeters (mm)" },
        { value: "ft", label: "Feet (ft)" },
        { value: "in", label: "Inches (in)" },
        { value: "yd", label: "Yards (yd)" },
        { value: "mi", label: "Miles (mi)" },
    ],
    mass: [
        { value: "kg", label: "Kilograms (kg)" },
        { value: "g", label: "Grams (g)" },
        { value: "mg", label: "Milligrams (mg)" },
        { value: "lb", label: "Pounds (lb)" },
        { value: "oz", label: "Ounces (oz)" },
        { value: "ton", label: "Metric Tons (t)" },
    ],
    temperature: [
        { value: "c", label: "Celsius (°C)" },
        { value: "f", label: "Fahrenheit (°F)" },
        { value: "k", label: "Kelvin (K)" },
    ],
    pressure: [
        { value: "pa", label: "Pascals (Pa)" },
        { value: "kpa", label: "Kilopascals (kPa)" },
        { value: "bar", label: "Bar" },
        { value: "psi", label: "PSI" },
        { value: "atm", label: "Atmosphere (atm)" },
    ],
}

export function UnitConverter() {
    const [category, setCategory] = useState<Category>("length")
    const [fromUnit, setFromUnit] = useState(UNITS.length[0].value)
    const [toUnit, setToUnit] = useState(UNITS.length[4].value)
    const [inputValue, setInputValue] = useState<string>("1")
    const [result, setResult] = useState<string>("")

    // Update units when category changes
    const handleCategoryChange = (newCategory: string) => {
        const cat = newCategory as Category
        setCategory(cat)
        setFromUnit(UNITS[cat][0].value)
        // Default to a different unit for conversion if possible
        setToUnit(UNITS[cat][1]?.value || UNITS[cat][0].value)
    }

    useEffect(() => {
        convert()
    }, [inputValue, fromUnit, toUnit, category])

    const convert = () => {
        const val = parseFloat(inputValue)
        if (isNaN(val)) {
            setResult("---")
            return
        }

        let baseVal = val

        // 1. Convert TO Base Unit (m, kg, C, Pa)
        switch (category) {
            case "length": // Base: meters
                if (fromUnit === "km") baseVal = val * 1000
                if (fromUnit === "cm") baseVal = val / 100
                if (fromUnit === "mm") baseVal = val / 1000
                if (fromUnit === "ft") baseVal = val * 0.3048
                if (fromUnit === "in") baseVal = val * 0.0254
                if (fromUnit === "yd") baseVal = val * 0.9144
                if (fromUnit === "mi") baseVal = val * 1609.34
                break
            case "mass": // Base: kg
                if (fromUnit === "g") baseVal = val / 1000
                if (fromUnit === "mg") baseVal = val / 1000000
                if (fromUnit === "lb") baseVal = val * 0.453592
                if (fromUnit === "oz") baseVal = val * 0.0283495
                if (fromUnit === "ton") baseVal = val * 1000
                break
            case "temperature": // Base: Celsius
                if (fromUnit === "f") baseVal = (val - 32) * (5 / 9)
                if (fromUnit === "k") baseVal = val - 273.15
                break
            case "pressure": // Base: Pa
                if (fromUnit === "kpa") baseVal = val * 1000
                if (fromUnit === "bar") baseVal = val * 100000
                if (fromUnit === "psi") baseVal = val * 6894.76
                if (fromUnit === "atm") baseVal = val * 101325
                break
        }

        // 2. Convert FROM Base Unit to Target
        let finalVal = baseVal
        switch (category) {
            case "length":
                if (toUnit === "km") finalVal = baseVal / 1000
                if (toUnit === "cm") finalVal = baseVal * 100
                if (toUnit === "mm") finalVal = baseVal * 1000
                if (toUnit === "ft") finalVal = baseVal / 0.3048
                if (toUnit === "in") finalVal = baseVal / 0.0254
                if (toUnit === "yd") finalVal = baseVal / 0.9144
                if (toUnit === "mi") finalVal = baseVal / 1609.34
                break
            case "mass":
                if (toUnit === "g") finalVal = baseVal * 1000
                if (toUnit === "mg") finalVal = baseVal * 1000000
                if (toUnit === "lb") finalVal = baseVal / 0.453592
                if (toUnit === "oz") finalVal = baseVal / 0.0283495
                if (toUnit === "ton") finalVal = baseVal / 1000
                break
            case "temperature":
                if (toUnit === "f") finalVal = (baseVal * 9) / 5 + 32
                if (toUnit === "k") finalVal = baseVal + 273.15
                break
            case "pressure":
                if (toUnit === "kpa") finalVal = baseVal / 1000
                if (toUnit === "bar") finalVal = baseVal / 100000
                if (toUnit === "psi") finalVal = baseVal / 6894.76
                if (toUnit === "atm") finalVal = baseVal / 101325
                break
        }

        // Format output
        setResult(finalVal.toLocaleString(undefined, { maximumFractionDigits: 4 }))
    }

    return (
        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">Unit Converter</h4>
                </div>

                <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-8">
                        <TabsTrigger value="length" className="text-xs">Len</TabsTrigger>
                        <TabsTrigger value="mass" className="text-xs">Mass</TabsTrigger>
                        <TabsTrigger value="temperature" className="text-xs">Temp</TabsTrigger>
                        <TabsTrigger value="pressure" className="text-xs">Pres</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                    <div className="space-y-1">
                        <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="h-8 text-right font-mono"
                        />
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UNITS[category].map(u => (
                                    <SelectItem key={u.value} value={u.value} className="text-xs">{u.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-slate-400">
                        <ArrowRightLeft className="h-4 w-4" />
                    </div>

                    <div className="space-y-1">
                        <div className="h-8 flex items-center justify-end px-3 rounded-md border border-slate-200 bg-white font-mono text-sm">
                            {result}
                        </div>
                        <Select value={toUnit} onValueChange={setToUnit}>
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UNITS[category].map(u => (
                                    <SelectItem key={u.value} value={u.value} className="text-xs">{u.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
