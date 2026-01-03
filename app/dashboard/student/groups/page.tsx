'use client';

import { useState, useEffect } from "react";
import { getAvailableGroups, getMyGroups, joinGroup, leaveGroup, upgradeMembership } from "@/app/actions/groups";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Star, LogOut, Lock, CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function GroupsPage() {
    const [activeTab, setActiveTab] = useState("explore");
    const [available, setAvailable] = useState<any[]>([]);
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [availRes, myRes] = await Promise.all([
            getAvailableGroups(),
            getMyGroups()
        ]);
        if (availRes.data) setAvailable(availRes.data);
        if (myRes.data) setMyGroups(myRes.data);
        setLoading(false);
    }

    async function handleJoin(groupId: string) {
        const res = await joinGroup(groupId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Joined group successfully (Freemium Trial)!");
            loadData();
            setActiveTab("my-groups");
        }
    }

    async function handleLeave(groupId: string) {
        if (confirm("Are you sure you want to leave this group?")) {
            const res = await leaveGroup(groupId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Left group");
                loadData();
            }
        }
    }

    async function handleUpgrade(groupId: string) {
        if (confirm("Confirm payment for full membership?")) {
            const res = await upgradeMembership(groupId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Membership Upgraded!");
                loadData();
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Groups</h1>
                    <p className="text-gray-500 mt-1">Connect, collaborate, and grow.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full md:w-auto mb-6">
                        <TabsTrigger value="explore">Explore Groups</TabsTrigger>
                        <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
                    </TabsList>

                    {/* EXPLORE TAB */}
                    <TabsContent value="explore">
                        <BentoGrid className="md:grid-cols-3">
                            {available.map(group => (
                                <BentoCard key={group.id} variant="glass" className="hover:scale-[1.02]">
                                    {group.image_url && (
                                        <div className="w-full h-32 mb-4 rounded-lg overflow-hidden relative">
                                            <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                                            {group.fee_amount > 0 && (
                                                <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                                                    R{group.fee_amount} Fee
                                                </Badge>
                                            )}
                                            {group.fee_amount === 0 && (
                                                <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Free</Badge>
                                            )}
                                        </div>
                                    )}
                                    <h3 className="font-bold text-lg">{group.name}</h3>
                                    <div className="text-xs text-indigo-600 font-medium capitalize mb-2">{group.type.replace('_', ' ')}</div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{group.description}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="text-xs text-gray-400">Public Group</div>
                                        <Button size="sm" onClick={() => handleJoin(group.id)}>Join Now</Button>
                                    </div>
                                </BentoCard>
                            ))}
                            {available.length === 0 && !loading && (
                                <div className="col-span-full py-12 text-center text-gray-400">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>You have joined all available groups!</p>
                                </div>
                            )}
                        </BentoGrid>
                    </TabsContent>

                    {/* MY GROUPS TAB */}
                    <TabsContent value="my-groups">
                        <div className="grid md:grid-cols-2 gap-6">
                            {myGroups.map(membership => (
                                <div key={membership.group_id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                    {membership.group.image_url && (
                                        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden shrink-0">
                                            <img src={membership.group.image_url} alt={membership.group.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl">{membership.group.name}</h3>
                                                <div className="text-sm text-gray-500">{membership.group.description}</div>
                                            </div>
                                            {membership.membership_status === 'paid' ? (
                                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0"><Star className="h-3 w-3 mr-1 fill-white" /> PRO Member</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-blue-600 border-blue-200">Trial Access</Badge>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                                            <div className="bg-gray-50 px-2 py-1 rounded">Joined: {new Date(membership.joined_at).toLocaleDateString()}</div>
                                            <div className="bg-gray-50 px-2 py-1 rounded">Role: {membership.role}</div>
                                        </div>

                                        <div className="mt-6 flex gap-3">
                                            {membership.membership_status === 'free_trial' && membership.group.fee_amount > 0 && (
                                                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={() => handleUpgrade(membership.group_id)}>
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Upgrade (R{membership.group.fee_amount})
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline">
                                                Access Hub
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => handleLeave(membership.group_id)}>
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {membership.membership_status === 'free_trial' && (
                                            <div className="mt-3 text-xs text-orange-600 flex items-center gap-1 bg-orange-50 p-2 rounded">
                                                <Sparkles className="h-3 w-3" />
                                                Trial expires on {new Date(membership.trial_ends_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {myGroups.length === 0 && !loading && (
                                <div className="text-center text-gray-400 py-12 flex flex-col items-center col-span-2">
                                    <Users className="h-12 w-12 mb-4 opacity-50" />
                                    <p>You haven't joined any groups yet.</p>
                                    <Button variant="link" onClick={() => setActiveTab("explore")}>Explore Groups</Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
