export interface InvitationResponse {
    id: string,
    role: string,
    status: string,
    accepted_at: string | null,
    tet_config: {
        id: string,
        year: number,
        name: string,
        total_budget: string,
        currency: string,
        owner: {
            id: string,
            email: string,
            name: string,
            image_url: string
        }
    }
}