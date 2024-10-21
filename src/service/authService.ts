import { OrgSubscription } from "@/constant"
import axios from "axios"
import { Request } from "express"

interface Organization {
    id: string
    name: string
    image: string | null
    metadata: string | null
    created_at: string
    subscription: OrgSubscription
    is_owner: boolean
}

interface User {
    id: string
    created_at: string
    email: string
    name: string
    given_name: string
    family_name: string
    picture: string | null
    locale: string | null
    metadata: string | null
    organizations: Organization[]
}

export const getBearerToken = (req: Request) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) {
        throw new Error("Unauthorized")
    }

    return bearerToken
}

export const getUserInfo = async (token: string) => {
    try {
        const baseUrl = process.env.API_AI_HUB!

        const { data } = await axios.get<User>(`${baseUrl}/verify/${token}`)

        return data
    } catch (error) {
        const errorMessage = `Error get user info: ${(error as Error).message}`
        console.error(errorMessage)
        throw new Error(errorMessage)
    }
}

export const isUserInOrg = (user: User, orgId: string) => {
    return user.organizations.some((org) => org.id === orgId)
}

export const getOrgFromUser = (user: User, orgId: string) => {
    return user.organizations.find((org) => org.id === orgId)
}
