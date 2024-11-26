import DocsList from "@/components/(회계)/(문서들)/DocsList";

export const metadata = {
  title: '문서목록',
};
export default async function Page() {
  return <DocsList />;
}