import {VegvesenVehicle} from "@/types/types";
import {VegvesenAPIError} from "@/utils/errors";

const URL = process.env.VEGVESEN_API_ROUTE;

export async function fetchVehicle(regNr: string): Promise<VegvesenVehicle> {
    const uppercaseRegNr = regNr.toUpperCase().trim();

    const url = `${URL}/${uppercaseRegNr}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new VegvesenAPIError(`Vegvesen API responded with status ${response.status}`);
        }

        const data = await response.json();

        const vehicle = data.kjoretoy?.[0] ?? data;
        if (!vehicle) {
            throw new VegvesenAPIError(`No vehicle found with registration number ${regNr}`);
        }

        return {
            make: vehicle.tekniskKjoretoy.merke || "UKJENT",
            model: vehicle.tekniskKjoretoy.handelsbetegnelse || "UKJENT",
            year: vehicle.registrering.forstegangsregistrering ? parseInt(vehicle.registrering.forstegangsregistrering) : 0,
            color: vehicle.tekniskKjoretoy.karosseri.farge || "UKJENT",
        };
    } catch (err) {
        if (err instanceof VegvesenAPIError) {
            console.warn(`Vehicle info not found for ${regNr}, using fallback:`, err.message);
        } else if (err instanceof Error) {
            console.error("Unexpected Vegvesen API error:", err.message);
        } else {
            console.error("Unknown error fetching vehicle info:", err);
        }
        throw new VegvesenAPIError("Failed to fetch vehicle info. Try again later.");
    }
}