import {supabase} from '../supabase';
import type {Car} from './types';
import {PlateAlreadyExistsError} from "../../app/error/PlateAlreadyExistsError";

// public.cars columns: id, user_id, name, plate, created_at
type CarRow = { id: string; name: string; plate: string };

function rowToCar(row: CarRow): Car {
    return {
        id: row.id,
        name: row.name,
        licensePlate: row.plate,
    };
}

export const carsService = {
    /** Load all cars belonging to the current authenticated user. */
    async list(): Promise<Car[]> {
        const {data: {user}} = await supabase.auth.getUser();
        if (!user) return [];

        const {data, error} = await supabase
            .from('cars')
            .select('id, name, plate')
            .eq('user_id', user.id)
            .order('created_at', {ascending: true});

        if (error) {
            console.error('[cars.list] error:', error.message, '| code:', error.code);
            throw error;
        }
        return (data ?? []).map(rowToCar);
    },

    async create(car: Pick<Car, 'name' | 'licensePlate'>): Promise<void> {

        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Not authenticated: cannot create car');
        }

        const {error} = await supabase
            .from('cars')
            .insert({
                user_id: user.id,
                name: car.name,
                plate: car.licensePlate,
            });

        if (error) {
            console.error(
                '[cars.create] error:',
                error.message,
                '| code:',
                error.code,
                '| details:',
                error.details
            );

            // PostgreSQL unique_violation
            if (error.code === '23505') {
                throw new PlateAlreadyExistsError(car.licensePlate);
            }

            throw error;
        }
    },

    /**
     * Update the persisted fields of a car (name / plate).
     * Returns true if a DB write was issued. Insurance / inspection dates have no
     * DB column and are intentionally ignored here (handled in memory by the context).
     */
    async update(id: string, changes: Partial<Car>): Promise<boolean> {
        const payload: Record<string, unknown> = {};
        console.log('boloooooooot payload', payload)
        if (changes.name !== undefined) payload.name = changes.name;
        if (changes.licensePlate !== undefined) payload.plate = changes.licensePlate;

        if (Object.keys(payload).length === 0) return false;

        const {error} = await supabase.from('cars').update(payload).eq('id', id);
        if (error) {
            console.error('[cars.update] error:', error.message, '| code:', error.code);
            throw error;
        }
        return true;
    },

    /** Delete a car (services/reminders cascade via FK / RLS on car_id). */
    async remove(id: string): Promise<void> {
        const {error} = await supabase.from('cars').delete().eq('id', id);
        if (error) {
            console.error('[cars.remove] error:', error.message, '| code:', error.code);
            throw error;
        }
    },
};
