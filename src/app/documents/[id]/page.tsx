import DocumentEditor from "./DocumentEditor";

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <DocumentEditor documentId={id} />;
}
