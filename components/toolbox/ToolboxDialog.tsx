"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { GraduationCap, Briefcase, Heart, PartyPopper, Calculator, ExternalLink } from "lucide-react"
import { UnitConverter } from "./UnitConverter"
import { ResourceList, ResourceItem } from "./ResourceList"

const ACADEMIC_RESOURCES: ResourceItem[] = [
    { name: "Studocu", href: "https://www.studocu.com", description: "Study notes and summaries" },
    { name: "MATLAB Online", href: "https://matlab.mathworks.com/", description: "Engineering computation software" },
    { name: "AutoCAD/SolidWorks Portal", href: "https://www.autodesk.com/education/home", description: "Design software access" },
    { name: "University Library", href: "https://www.ub.bw/research/library", description: "e-books and catalogues" },
]

const CAREER_RESOURCES: ResourceItem[] = [
    { name: "Debswana Careers", href: "https://www.debswana.com/careers-2/", description: "Diamond mining opportunities" },
    { name: "Sandfire Motheo Copper Mine", href: "https://www.sandfiremotheo.co.bw/site/work-with-us", description: "Mining careers" },
    { name: "De Beers Graduate Programme", href: "http://www.debeersgroup.com", description: "International development" },
    { name: "Rand Merchant Bank", href: "https://www.rmb.co.bw/careers", description: "Finance and engineering" },
    { name: "ERB Botswana", href: "https://erb.org.bw", description: "Engineers Registration Board" },
    { name: "Botswana Inst. of Engineers", href: "https://bie.co.bw", description: "Professional society" },
]

const WELLNESS_RESOURCES: ResourceItem[] = [
    { name: "UB Counselling Services", href: "https://www.ub.bw/experience/campus-life/counselling", description: "Campus clinic booking" },
    { name: "TalkLife", href: "https://www.talklife.com/", description: "Peer support network" },
    { name: "Calm (Android)", href: "https://play.google.com/store/apps/details?id=com.calm.android", description: "Meditation and sleep" },
    { name: "Forest (Android)", href: "https://play.google.com/store/apps/details?id=cc.forestapp", description: "Focus timer" },
]

const ENTERTAINMENT_RESOURCES: ResourceItem[] = [
    { name: "Academic Calendar", href: "https://www.ub.bw/sites/default/files/2021-06/UNDERGRADUATE-CALENDAR-2021-2022.pdf", description: "Key dates and events" },
    { name: "Debonairs Pizza Deals", href: "https://debonairspizza.co.bw/", description: "Local food discounts" },
]

const YOUTUBE_GENERAL: ResourceItem[] = [
    { name: "Real Engineering", href: "https://www.youtube.com/RealEngineering", description: "Complex topics animated" },
    { name: "Smarter Every Day", href: "https://www.youtube.com/channel/UC6107grRI4m0o2-emgoDnAA", description: "Physics & fluid dynamics" },
    { name: "Applied Science", href: "https://www.youtube.com/@AppliedScience", description: "High-tech experiments" },
    { name: "Mark Rober", href: "https://www.youtube.com/channel/UCY1kMZp36IQSyNx_9h4mpCg", description: "Elaborate engineering projects" },
    { name: "Veritasium", href: "https://www.youtube.com/veritasium", description: "High-quality STEM phenomena" },
]

const YOUTUBE_MECH: ResourceItem[] = [
    { name: "Learn Engineering", href: "https://www.youtube.com/channel/UCsm2OHyG9Mzf7UtfjUf6QTw", description: "Core concepts & CAD/CAE" },
    { name: "Practical Engineering", href: "https://www.youtube.com/@PracticalEngineeringChannel", description: "Civil & real-world problems" },
    { name: "Engineering Explained", href: "https://www.youtube.com/user/EngineeringExplained", description: "Automotive systems" },
    { name: "Clickspring", href: "https://www.youtube.com/channel/UCworsKCR-Sx6R6-BnIjS2MA", description: "Precision machining" },
    { name: "AvE", href: "https://www.youtube.com/@arduinoversusevil2025", description: "Tools & huge machinery" },
]

const YOUTUBE_ELEC: ResourceItem[] = [
    { name: "EEVblog", href: "https://www.youtube.com/eevblog", description: "Electronics teardowns" },
    { name: "ElectroBOOM", href: "https://www.youtube.com/channel/UCJ0-OtVpF0wOKEqT2Z1HEtA", description: "Humorous electrical mishaps" },
    { name: "GreatScott!", href: "https://www.youtube.com/@greatscottlab", description: "Practical electronics projects" },
]

interface ToolboxDialogProps {
    children?: React.ReactNode
}

export function ToolboxDialog({ children }: ToolboxDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button variant="outline">Open Toolbox</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[85vh] sm:h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle>Engineering Toolbox</DialogTitle>
                    <DialogDescription>
                        Essential tools and resources for your journey.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="academic" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-5 mb-4 shrink-0">
                        <TabsTrigger value="academic" className="text-xs sm:text-xs px-1"><GraduationCap className="w-4 h-4 sm:mr-1 md:mr-2" /><span className="hidden sm:inline">Academic</span></TabsTrigger>
                        <TabsTrigger value="career" className="text-xs sm:text-xs px-1"><Briefcase className="w-4 h-4 sm:mr-1 md:mr-2" /><span className="hidden sm:inline">Career</span></TabsTrigger>
                        <TabsTrigger value="media" className="text-xs sm:text-xs px-1"><ExternalLink className="w-4 h-4 sm:mr-1 md:mr-2" /><span className="hidden sm:inline">Watch</span></TabsTrigger>
                        <TabsTrigger value="wellness" className="text-xs sm:text-xs px-1"><Heart className="w-4 h-4 sm:mr-1 md:mr-2" /><span className="hidden sm:inline">Wellness</span></TabsTrigger>
                        <TabsTrigger value="social" className="text-xs sm:text-xs px-1"><PartyPopper className="w-4 h-4 sm:mr-1 md:mr-2" /><span className="hidden sm:inline">Fun</span></TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto pr-1">
                        <TabsContent value="academic" className="mt-0 space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center text-slate-900">
                                    <Calculator className="w-4 h-4 mr-2 text-indigo-500" />
                                    Tools
                                </h4>
                                <UnitConverter />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-900">Resources</h4>
                                <ResourceList items={ACADEMIC_RESOURCES} />
                            </div>
                        </TabsContent>

                        <TabsContent value="career" className="mt-0 space-y-4">
                            <ResourceList items={CAREER_RESOURCES} />
                        </TabsContent>

                        <TabsContent value="media" className="mt-0 space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-900">General Engineering & STEM</h4>
                                <ResourceList items={YOUTUBE_GENERAL} />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-900">Mechanical & Manufacturing</h4>
                                <ResourceList items={YOUTUBE_MECH} />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-900">Electrical & Electronics</h4>
                                <ResourceList items={YOUTUBE_ELEC} />
                            </div>
                        </TabsContent>

                        <TabsContent value="wellness" className="mt-0 space-y-4">
                            <ResourceList items={WELLNESS_RESOURCES} />
                        </TabsContent>

                        <TabsContent value="social" className="mt-0 space-y-4">
                            <ResourceList items={ENTERTAINMENT_RESOURCES} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
