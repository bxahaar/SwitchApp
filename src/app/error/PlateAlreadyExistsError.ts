export class PlateAlreadyExistsError extends Error {
    constructor(plate: string) {
        super(`A car with license plate "${plate}" already exists.`);
        this.name = 'PlateAlreadyExistsError';
    }
}