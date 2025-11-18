'use client';

import {useState} from 'react';
import Link from 'next/link';
import {trpc} from '@/utils/trpc';
import {regNrSchema} from "@/validators/validators";
import {toast} from "sonner"
import {MoveDown, MoveUp} from "lucide-react";

type SortField = "createdAt" | "year" | "color" | "model";
type SortOreder = "asc" | "desc";

export default function Home() {
    const [regNr, setRegNr] = useState('');
    const [error, setError] = useState('');
    const {data: cars, isLoading, refetch} = trpc.getCars.useQuery();

    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOreder>('desc');

    const createCar = trpc.createCar.useMutation({
        onSuccess: () => {
            toast.success(`Bil: ${regNr} ble lagt til!`)
            refetch();
            setRegNr('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = regNrSchema.safeParse(regNr);

        if (!result.success) {
            setError("Ugyldig registreringsnummer");
            return;
        }

        if (regNr.trim()) {
            createCar.mutate({regNr: regNr.trim()});
        }
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder(field === "createdAt" ? "desc" : "asc");
        }
    }

    const normalize = (str: string | null | undefined): string =>
        (str || '').toString().trim().toLowerCase();

    const sortedCars = [...(cars || [])].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortField) {
            case 'createdAt':
                aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                break;
            case 'year':
                aValue = a.year || 0;
                bValue = b.year || 0;
                break;
            case 'color':
                aValue = normalize(a.color);
                bValue = normalize(b.color);
                break;
            case 'model':
                aValue = normalize(a.model);
                bValue = normalize(b.model);
                break;
        }

        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortOrder === 'asc' ? comparison : -comparison;
    })

    const isActive = (field: SortField) => sortField === field;

    const getSortLabel = (field: SortField) => {
        if (!isActive(field)) return '';
        const order = sortOrder;
        if (field === 'createdAt') return order === 'desc' ? 'Nyeste først' : 'Eldste først';
        if (field === 'year') return order === 'desc' ? 'Nyeste først' : 'Eldste først';
        return order === 'asc' ? 'A → Å' : 'Å → A';
    };

    const deleteCar = trpc.deleteCar.useMutation({
        onSuccess: () => {
            refetch();
        }
    })

    const handleCarDelete = (id: number) => {
        deleteCar.mutate({
            id
        })
    }

    return (
        <main className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl mb-8">Bilregister</h1>

            {/* Create Car Form */}
            <section className="mb-12">
                <h2 className="text-xl mb-4">Legg til ny bil</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Skriv inn registreringsnummer (f.eks. EK12345)"
                            value={regNr}
                            onChange={(e) => setRegNr(e.target.value)}
                            disabled={createCar.isPending}
                            className="w-full px-3 py-3 text-base border border-gray-300 rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={createCar.isPending || !regNr.trim()}
                        className="px-6 py-3 text-base bg-blue-600 text-white border-none rounded whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                        {createCar.isPending ? 'Legger til...' : 'Legg til bil'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
                        <p className="m-0">Feil: {error}</p>
                    </div>
                )}

                {createCar.error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
                        <p className="m-0">Feil: {createCar.error.message}</p>
                    </div>
                )}

                {createCar.isSuccess && (
                    <div className="mt-4 p-4 bg-green-50 text-green-600 rounded">
                        <p className="m-0">Bil lagt til!</p>
                    </div>
                )}
            </section>

            {/* Cars List */}
            <section>
                <h2 className="text-xl mb-4">Registrerte biler</h2>

                {isLoading && (
                    <div className="p-8 text-center text-gray-600">
                        Laster biler...
                    </div>
                )}

                {!isLoading && (!cars || cars.length === 0) && (
                    <div className="p-8 text-center text-gray-600">
                        Ingen biler registrert ennå. Legg til en over for å komme i gang!
                    </div>
                )}

                {!isLoading && cars && cars.length > 0 && (
                    <>
                        <div className="flex flex-row gap-2 mb-3 justify-between">
                            <div className="flex flex-wrap gap-3">
                                {([
                                    {field: 'createdAt' as const, label: 'Dato lagt til'},
                                    {field: 'year' as const, label: 'Årstall'},
                                    {field: 'color' as const, label: 'Farge'},
                                    {field: 'model' as const, label: 'Modell'},
                                ]).map(({field, label}) => (
                                    <button
                                        key={field}
                                        onClick={() => toggleSort(field)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md border font-medium text-sm transition-all
                                        ${isActive(field)
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                            : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {label}
                                        {isActive(field) && (
                                            sortOrder === 'desc' ? <MoveDown size={16}/> : <MoveUp size={16}/>
                                        )}
                                        {isActive(field) && (
                                            <span className="text-gray-600 font-normal">
                                            ({getSortLabel(field)})
                                        </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4">
                            {sortedCars.map((car) => (
                                <div key={car.id}>
                                    <Link
                                        key={car.id}
                                        href={`/cars/${car.id}`}
                                        className="block no-underline text-inherit"
                                    >
                                        <div
                                            className="p-6 bg-gray-50 border border-gray-200 rounded-lg grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-blue-600 hover:-translate-y-0.5">
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    Registreringsnummer
                                                </div>
                                                <div className="text-xl font-bold">
                                                    {car.regNr}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    Merke & Modell
                                                </div>
                                                <div className="text-base font-medium">
                                                    {car.make} {car.model}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">
                                                    År
                                                </div>
                                                <div className="text-base">{car.year}</div>
                                            </div>
                                            {car.color && (
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        Farge
                                                    </div>
                                                    <div className="text-base">{car.color}</div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
