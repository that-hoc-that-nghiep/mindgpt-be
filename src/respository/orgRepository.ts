import { DocumentTypeRequest, MindmapType } from "@/constant";
import {
  ConversationModel,
  EdgesModel,
  MindmapModel,
  NodesModel,
} from "@/model/mindmapModel";
import { getFileNameFromUrl } from "@/service/mindmapService";

export class OrgRepository {
  async getFilenamesByDocTypePdf(orgId: string) {
    const mindmaps = await MindmapModel.find({
      orgId: orgId,
      type: MindmapType.SUMMARY,
      "document.type": DocumentTypeRequest.PDF,
    }).select("document.url");
    const documentUrls = mindmaps.map((mindmap) => mindmap.document.url);
    const fileNames = documentUrls.map((url) => getFileNameFromUrl(url));
    return fileNames;
  }
  async getDocumentsIdByDocTypePdf(orgId: string) {
    try {
      const mindmaps = await MindmapModel.find({
        orgId: orgId,
        type: MindmapType.SUMMARY,
        "document.type": DocumentTypeRequest.PDF,
      }).select("documentsId");
      const mindmapIds = mindmaps.flatMap((mindmap) => mindmap.documentsId);
      return mindmapIds;
    } catch (error) {
      const errorMessage = `Error getting mindmapsId by docTypePdf: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
  async getMindmapsIdByOrgId(orgId: string) {
    try {
      const mindmaps = await MindmapModel.find({ orgId: orgId }).select("_id");
      const mindmapIds = mindmaps.map((mindmap) => mindmap._id);
      return mindmapIds;
    } catch (error) {
      const errorMessage = `Error getting mindmapsId by orgId: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
  async deleteMindmapByOrgId(orgId: string) {
    try {
      const mindmapsId = await this.getMindmapsIdByOrgId(orgId);

      if (mindmapsId.length === 0) {
        return;
      }
      const checkAcknowledged = (result: any, errorMessage: string) => {
        if (!result.acknowledged) {
          throw new Error(errorMessage);
        }
      };
      const mindmaps = await MindmapModel.find({
        _id: { $in: mindmapsId },
      }).select("nodes edges conversation");

      const nodeIds = mindmaps.flatMap((mindmap) => mindmap.nodes);
      const edgeIds = mindmaps.flatMap((mindmap) => mindmap.edges);
      const conversationIds = mindmaps.flatMap(
        (mindmap) => mindmap.conversation
      );
      const [nodeResult, edgeResult, conversationResult] = await Promise.all([
        NodesModel.deleteMany({ _id: { $in: nodeIds } }),
        EdgesModel.deleteMany({ _id: { $in: edgeIds } }),
        ConversationModel.deleteMany({ _id: { $in: conversationIds } }),
      ]);

      checkAcknowledged(nodeResult, "Error delete nodes");
      checkAcknowledged(edgeResult, "Error delete edges");
      checkAcknowledged(conversationResult, "Error delete conversation");

      await MindmapModel.deleteMany({ _id: { $in: mindmapsId } });
    } catch (error) {
      const errorMessage = `Error delete mindmaps by orgId: ${
        (error as Error).message
      }`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
export const orgRepository = new OrgRepository();
