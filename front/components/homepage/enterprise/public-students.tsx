"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/fetcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentProfile {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  niveau_etu: string;
}

export default function PublicStudents() {
  const { get } = useApi();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await get("accounts/etudiant/public");
      const data = await res.json();
      if (res.ok) {
        setStudents(data);
        setFilteredStudents(data);
      } else {
        setErrorMsg(data.message || "Erreur lors du chargement des étudiants");
      }
    } catch (error) {
      setErrorMsg("Erreur lors du chargement des étudiants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter((student) => {
      const fullName = `${student.prenom} ${student.nom}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement des profils étudiants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Profils publics des étudiants
        </h2>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="space-y-2">
        <Label htmlFor="search">Rechercher un étudiant</Label>
        <Input
          id="search"
          type="text"
          placeholder="Antoine FONTANEZ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Liste des étudiants */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "Aucun étudiant ne correspond à votre recherche"
              : "Aucun profil public disponible"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id_utilisateur}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.prenom} {student.nom}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Niveau: <span className="font-medium">{student.niveau_etu}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-gray-500 pt-4">
        {filteredStudents.length} étudiant{filteredStudents.length > 1 ? "s" : ""}{" "}
        {searchTerm ? "trouvé(s)" : "disponible(s)"}
      </div>
    </div>
  );
}
