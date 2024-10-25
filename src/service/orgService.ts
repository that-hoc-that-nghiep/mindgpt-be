import { OrgRepository } from "@/respository/orgRepository";
import { createClient } from "@supabase/supabase-js";
import { handleCallApiDeleteDocumentsId } from "./mindmapService";
import config from "config";
import axios from "axios";
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
const baseUrl = config.API_AUTH;
export class OrgService {
  private orgRepository: OrgRepository;
  constructor(repository: OrgRepository = new OrgRepository()) {
    this.orgRepository = repository;
  }

  async deleteOrg(orgId: string, token: string) {
    try {
      const documentsId = await this.orgRepository.getDocumentsIdByDocTypePdf(
        orgId
      );
      const filenames = await this.orgRepository.getFilenamesByDocTypePdf(
        orgId
      );
      //   const { error: storageError } = await supabase.storage
      //     .from("document")
      //     .remove(filenames);
      //   if (storageError) {
      //     throw new Error(
      //       `Failed to remove file from storage supabase: ${storageError.message}`
      //     );
      //   }
      //   handleCallApiDeleteDocumentsId(documentsId);
      //   await this.orgRepository.deleteMindmapByOrgId(orgId);
      //   await hanleCallApiAuthRemoveOrg(orgId, token);

      return {
        documentsId,
        filenames,
      };
    } catch (error) {
      const errorMessage = `${(error as Error).message}`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const hanleCallApiAuthRemoveOrg = async (
  orgId: string,
  token: string
) => {
  try {
    const url = `${baseUrl}/org/${orgId}`;
    const response = await axios.delete(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: function (status: number) {
        return status >= 200 && status < 300;
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Status code:", error.response?.status);
      console.error("Response data:", error.response?.data);

      throw new Error(`Fetch failed from api auth: ${error.message}`);
    } else {
      throw new Error("An unexpected error occurred from api auth.");
    }
  }
};
export const orgService = new OrgService();
